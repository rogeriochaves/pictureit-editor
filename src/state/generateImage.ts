import { Editor, nonRenderableLayerTypes } from "@layerhub-io/core"
import ObjectExporter from "@layerhub-io/core/src/utils/object-exporter"
import { IGenerationFrame, ILayer } from "@layerhub-io/types"
import { fabric } from "fabric"
import { atom, atomFamily } from "recoil"
import { AnyModel, firstModelByCapability, getModelByKey, hasCapability, ModelKeys } from "../api"
import { GenerationOutput, GenerationProgressEvent, ModelCapability } from "../api/types"
import { extractErrorMessage } from "../api/utils"
import { canvasFromImage } from "../utils/canvas-from-image"
import { paintItBlack } from "../utils/clip-mask"
import { lazySelectorFamily } from "../utils/lazySelectorFamily"
import { addGaussianNoise } from "../utils/noise"
import { hasAnyTransparentPixel } from "../utils/transparency"
import { currentUserQuery } from "./user"

export const DEFAULT_PROMPT_STRENGTH = 0.6
export const DEFAULT_GUIDANCE = 7.5
export const DEFAULT_STEPS = 50
export const DEFAULT_NUM_ANIMATION_FRAMES = 3
export const DEFAULT_NUM_INTERPOLATION_STEPS = 2

export const generateImageCall = lazySelectorFamily({
  key: "generateImageCall",
  get:
    ({ set, refresh }) =>
    async (params: { frame: fabric.GenerationFrame; editor: Editor; advanceSteps: boolean }) => {
      try {
        params.editor.history.save()
        await generateImage(params, (item: GenerationDoneQueueItem) => {
          set(generationDoneQueueState, (queue) => [...queue, item])
        })
      } catch (err) {
        if ((err as any).status == 401) {
          refresh(currentUserQuery)
        }
        if ((err as any).status == 402) {
          set(paymentRequiredState, true)
        }

        throw err
      }
    },
})

export const hidePopupState = atom({
  key: "hidePopupState",
  default: false,
})

export const paymentRequiredState = atom({
  key: "paymentRequiredState",
  default: false,
})

export type GenerationDoneQueueItem = { id: string; url: string; type: "video" }

export const generationDoneQueueState = atom({
  key: "generationDoneQueueState",
  default: [] as GenerationDoneQueueItem[],
})

export const generateActionState = atomFamily({
  key: "generateActionState",
  default: "generate" as "generate" | "advance",
})

const generateImage = async (
  {
    frame,
    editor,
    advanceSteps,
  }: {
    frame: fabric.GenerationFrame
    editor: Editor
    advanceSteps: boolean
  },
  enqueueDone: (item: GenerationDoneQueueItem) => void
) => {
  try {
    trackGa()

    const result = advanceSteps
      ? await generateAdvanceSteps({ frame, editor })
      : await generateImageOrVideo({ frame, editor })

    if (result.url) {
      if (result.url.match(/\.mp4/)) {
        enqueueDone({ id: frame.id, url: result.url, type: "video" })
      } else {
        // TODO: enqueue images as well so that it can be loaded even when on different scene
        await frame.setImage(result.url)
        editor.objects.afterAddHook(frame as fabric.Object, false)
      }
      return { image: result.url }
    }

    throw "no url found on the result"
  } catch (err) {
    frame.showError(await extractErrorMessage(err))
    editor.objects.afterAddHook(frame as fabric.Object, false)

    throw err
  }
}

const generateAdvanceSteps = async ({
  frame,
  editor,
}: {
  frame: fabric.GenerationFrame
  editor: Editor
}): Promise<GenerationOutput> => {
  const numInferenceSteps = frame.metadata?.steps || DEFAULT_STEPS
  showStartingLoading(frame, editor)

  const renderedFrame = await renderNewInitImage(editor, frame)
  if (!renderedFrame) {
    throw "error rendering image to advance a step"
  }

  const image = renderedFrame.toDataURL("image/jpeg")
  const stepsToSkip = frame.metadata?.accumulatedSteps || frame.metadata?.steps || 50

  const model =
    (frame.metadata?.modelKey && getModelByKey(frame.metadata.modelKey as ModelKeys)) ||
    (await renderToDetectModelToUse(editor, frame))

  if (!model || !hasCapability(model, ModelCapability.ADVANCE)) {
    alert("Sorry, no advance model was found, this option should have been unavailable")
    return Promise.reject("Misconfigured")
  }

  const result = await model.call({
    onLoadProgress: onLoadProgress(frame),
    prompt: frame.metadata?.prompt || "",
    init_image: image,
    num_inference_steps: stepsToSkip + numInferenceSteps,
    skip_timesteps: stepsToSkip,
    seed: 42,
  })

  frame.metadata = {
    ...frame.metadata,
    accumulatedSteps: stepsToSkip + numInferenceSteps,
  }

  return result
}

export const animationTimeEstimation = (frame: fabric.GenerationFrame) => {
  const numAnimationFrames = frame.metadata?.numAnimationFrames || DEFAULT_NUM_ANIMATION_FRAMES
  const numInterpolationSteps = frame.metadata?.numInterpolationSteps || DEFAULT_NUM_INTERPOLATION_STEPS

  const steps = frame.metadata?.steps || DEFAULT_STEPS
  // Takes around 2.6s for 50 steps per frame
  const perFrame = (2600 / 50) * steps * numInterpolationSteps

  return { total: perFrame * numAnimationFrames, perFrame }
}

export const renderToDetectModelToUse = async (editor: Editor, frame: fabric.GenerationFrame) => {
  const [_initImage, initImageWithNoise, initImageCanvas] = await renderInitImage(editor, frame, false)

  return detectModelToUse(editor, frame, initImageWithNoise, initImageCanvas)
}

const detectModelToUse = (
  editor: Editor,
  frame: fabric.GenerationFrame,
  initImageWithNoise: string | undefined,
  initImageCanvas: HTMLCanvasElement | undefined
): AnyModel | undefined => {
  const hasOverlappingFrames = getOverlappingFrames(editor, frame).length > 0
  const hasImageAndTransparency =
    initImageCanvas && frame.getImage() && hasAnyTransparentPixel(initImageCanvas.getContext("2d")!)

  if (initImageWithNoise && (hasOverlappingFrames || hasImageAndTransparency)) {
    return firstModelByCapability(ModelCapability.INPAINTING)
  }
  return firstModelByCapability(ModelCapability.BASIC)
}

const longLoadingTimeouts: { [key: string]: NodeJS.Timeout } = {}

const showStartingLoading = (frame: fabric.GenerationFrame, editor: Editor) => {
  frame.showLoading(20_000, "Starting...")

  const updateLoadingMessage = (message: string) => {
    const loadingStepLabel = frame.getLoadingStepLabel()
    if (loadingStepLabel) {
      loadingStepLabel.text = message
      editor.canvas.requestRenderAll()
    }
  }

  clearTimeout(longLoadingTimeouts[frame.id])
  longLoadingTimeouts[frame.id] = setTimeout(() => {
    updateLoadingMessage("Taking a little longer than usual...")
    longLoadingTimeouts[frame.id] = setTimeout(() => {
      updateLoadingMessage("Hang in there...")
    }, 30_000)
  }, 20_000)
}

const onLoadProgress = (frame: fabric.GenerationFrame) => (event: GenerationProgressEvent) => {
  if ("progress" in event) {
    clearTimeout(longLoadingTimeouts[frame.id])
    frame.moveLoading(event.progress / 100, 500)
  }
  if ("step" in event) {
    frame.showLoading(animationTimeEstimation(frame).perFrame, `Frame ${event.step + 1}`)
  }
}

const generateImageOrVideo = async ({
  frame,
  editor,
}: {
  frame: fabric.GenerationFrame
  editor: Editor
}): Promise<GenerationOutput> => {
  const numInferenceSteps = frame.metadata?.steps || 50
  showStartingLoading(frame, editor)

  const [initImage, initImageWithNoise, initImageCanvas] = await renderInitImage(editor, frame, true)
  const clipMask = initImage && (await renderClipMask(editor, frame))

  frame.metadata = {
    ...frame.metadata,
    initImage: {
      ...(frame.metadata?.initImage || {}),
      fixed: true,
      image: initImage,
      noise: frame.getNoise(),
    },
    accumulatedSteps: numInferenceSteps,
  }

  const model =
    (frame.metadata.modelKey && getModelByKey(frame.metadata.modelKey as ModelKeys)) ||
    detectModelToUse(editor, frame, initImageWithNoise, initImageCanvas)

  if (!model) {
    alert(
      "Sorry, something is misconfigured, no model was found to be used, please try creating another Generation Frame"
    )
    return Promise.reject("Misconfigured")
  }

  return model.call({
    onLoadProgress: onLoadProgress(frame),
    prompt: frame.metadata?.prompt || "",
    num_inference_steps: numInferenceSteps,

    guidance_scale: frame.metadata?.guidance || DEFAULT_GUIDANCE,

    init_image: initImageWithNoise,
    prompt_strength: frame.metadata?.initImage?.promptStrength ?? DEFAULT_PROMPT_STRENGTH,

    mask: clipMask,

    negative_prompt: frame.metadata?.negativePrompt,

    prompt_end: frame.metadata?.promptEnd || "",
    num_animation_frames: frame.metadata?.numAnimationFrames || DEFAULT_NUM_ANIMATION_FRAMES,
    num_interpolation_steps: frame.metadata?.numInterpolationSteps || DEFAULT_NUM_INTERPOLATION_STEPS,
    film_interpolation: true,
    output_format: "mp4",
  })
}

export const renderInitImage = async (
  editor: Editor,
  generationFrame: fabric.GenerationFrame,
  renderInitImage: boolean
): Promise<[string | undefined, string | undefined, HTMLCanvasElement | undefined]> => {
  let initImageCanvas
  let initImage
  let initImageWithNoise
  if (generationFrame.metadata?.initImage?.fixed) {
    if (generationFrame.metadata?.initImage?.image) {
      initImageCanvas = await canvasFromImage(
        generationFrame.metadata?.initImage?.image,
        generationFrame.width!,
        generationFrame.height!
      )
    }
  } else {
    initImageCanvas = await renderNewInitImage(editor, generationFrame)
  }

  if (initImageCanvas) {
    if (renderInitImage) {
      initImage = initImageCanvas.toDataURL("image/png")
    }
    addGaussianNoise(initImageCanvas.getContext("2d")!, generationFrame.getNoise())
    initImageWithNoise = initImageCanvas && initImageCanvas.toDataURL("image/png")
  }

  return [initImage, initImageWithNoise, initImageCanvas]
}

export const renderNewInitImage = async (
  editor: Editor,
  generationFrame: fabric.GenerationFrame
): Promise<HTMLCanvasElement | undefined> => {
  const overlappingFrames = getOverlappingFrames(editor, generationFrame)

  return await exportFrameToCanvas(editor, generationFrame, [generationFrame, ...overlappingFrames])
}

export const renderClipMask = async (
  editor: Editor,
  generationFrame: fabric.GenerationFrame
): Promise<string | undefined> => {
  const [_, __, canvas] = await renderInitImage(editor, generationFrame, false)
  if (canvas) {
    paintItBlack(canvas.getContext("2d")!)

    return canvas.toDataURL("image/png")
  }
}

const exportFrameToCanvas = async (
  editor: Editor,
  generationFrame: fabric.GenerationFrame,
  layerList: fabric.GenerationFrame[]
) => {
  const frameOptions = {
    ...editor.frame.options,
    top: 0,
    left: 0,
  }

  const objectExporter = new ObjectExporter()

  const layers = layerList
    .map((layer) => {
      const exported = objectExporter.export(layer.toObject(), frameOptions) as IGenerationFrame
      exported.objects = exported.objects?.filter(
        (object: ILayer) => !object.id?.match(/-background$/) && !nonRenderableLayerTypes.includes(object.type)
      )

      return exported
    })
    .filter((exported) => (exported.objects?.length || 0) > 0)

  if (layers.length == 0) return

  const canvas = await editor.renderer.renderCanvas({
    id: "",
    frame: { width: generationFrame.width ?? 0, height: generationFrame.height ?? 0 },
    layers,
    metadata: {},
    top: generationFrame.top,
    left: generationFrame.left,
  })

  return canvas
}

export const getOverlappingFrames = (editor: Editor, generationFrame: fabric.GenerationFrame) => {
  const zIndex = editor.canvas.canvas.getObjects().indexOf(generationFrame as fabric.Object)
  return editor.canvas.canvas
    .getObjects()
    .slice(zIndex)
    .filter((anotherFrame) => {
      return (
        anotherFrame != generationFrame &&
        anotherFrame instanceof fabric.GenerationFrame &&
        generationFrame.intersectsWithObject(anotherFrame as fabric.Object)
      )
    }) as fabric.GenerationFrame[]
}

const trackGa = () => {
  try {
    if ("gtag" in window) {
      //@ts-ignore
      window.gtag("event", "editor", {
        category: "generate",
        label: "click",
      })
    }
  } catch (e) {
    // no problemo
  }
}
