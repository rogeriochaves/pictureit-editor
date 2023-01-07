import { Editor, nonRenderableLayerTypes } from "@layerhub-io/core"
import ObjectExporter from "@layerhub-io/core/src/utils/object-exporter"
import { ModelTypes } from "@layerhub-io/objects"
import { IGenerationFrame, ILayer } from "@layerhub-io/types"
import { fabric } from "fabric"
import { atom, atomFamily } from "recoil"
import api, { GenerationProgressEvent, StableDiffusionOutput } from "../api"
import { extractErrorMessage } from "../api/utils"
import { canvasFromImage } from "../utils/canvas-from-image"
import { paintItBlack } from "../utils/clip-mask"
import { lazySelectorFamily } from "../utils/lazySelectorFamily"
import { addGaussianNoise } from "../utils/noise"
import { hasAnyTransparentPixel } from "../utils/transparency"
import { currentUserQuery } from "./user"

export const DEFAULT_PROMPT_STRENGTH = 0.8
export const DEFAULT_GUIDANCE = 7.5
export const DEFAULT_STEPS = 50

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
      if (frame.metadata?.model == "stable-diffusion-animation") {
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
}): Promise<StableDiffusionOutput> => {
  const numInferenceSteps = frame.metadata?.steps || DEFAULT_STEPS
  showStartingLoading(frame, editor)

  const renderedFrame = await renderNewInitImage(editor, frame)
  if (!renderedFrame) {
    throw "error rendering image to advance a step"
  }

  const image = renderedFrame.toDataURL("image/jpeg")
  const stepsToSkip = frame.metadata?.accumulatedSteps || frame.metadata?.steps || 50

  const result = await api.stableDiffusionAdvanceSteps(
    {
      prompt: frame.metadata?.prompt || "",
      init_image: image,
      num_inference_steps: stepsToSkip + numInferenceSteps,
      skip_timesteps: stepsToSkip,
      seed: 42,
    },
    onLoadProgress(frame)
  )

  frame.metadata = {
    ...frame.metadata,
    accumulatedSteps: stepsToSkip + numInferenceSteps,
  }

  return result
}

export const animationTimeEstimation = (frame: fabric.GenerationFrame) => {
  const numAnimationFrames = 3
  const numInterpolationSteps = 2

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
): ModelTypes => {
  const hasOverlappingFrames = getOverlappingFrames(editor, frame).length > 0
  const hasImageAndTransparency =
    initImageCanvas && frame.getImage() && hasAnyTransparentPixel(initImageCanvas.getContext("2d")!)

  if (initImageWithNoise && (hasOverlappingFrames || hasImageAndTransparency)) {
    return "stable-diffusion-inpainting"
  }
  return "stable-diffusion"
}

const showStartingLoading = (frame: fabric.GenerationFrame, editor: Editor) => {
  frame.showLoading(20_000, "Starting...")
  setTimeout(() => {
    const loadingStepLabel = frame.getLoadingStepLabel()
    if (loadingStepLabel && loadingStepLabel.text == "Starting...") {
      loadingStepLabel.text = "Taking a little longer than usual..."
      editor.canvas.requestRenderAll()
    }
  }, 20_000)
  setTimeout(() => {
    const loadingStepLabel = frame.getLoadingStepLabel()
    if (loadingStepLabel && loadingStepLabel.text == "Taking a little longer than usual...") {
      loadingStepLabel.text = "Hang in there..."
      editor.canvas.requestRenderAll()
    }
  }, 50_000)
}

const onLoadProgress = (frame: fabric.GenerationFrame) => (event: GenerationProgressEvent) => {
  if ("progress" in event) {
    frame.moveLoading(event.progress / 100, 500)
  }
}

const generateImageOrVideo = async ({
  frame,
  editor,
}: {
  frame: fabric.GenerationFrame
  editor: Editor
}): Promise<StableDiffusionOutput> => {
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

  const model = frame.metadata.model || detectModelToUse(editor, frame, initImageWithNoise, initImageCanvas)

  return model == "stable-diffusion-inpainting"
    ? await api.stableDiffusionInpainting(
        {
          prompt: frame.metadata?.prompt || "",
          num_inference_steps: numInferenceSteps,
          guidance_scale: frame.metadata?.guidance || DEFAULT_GUIDANCE,
          image: initImageWithNoise,
          mask: clipMask,
        },
        onLoadProgress(frame)
      )
    : model == "openjourney"
    ? await api.openJourney(
        {
          prompt: frame.metadata?.prompt || "",
          num_inference_steps: numInferenceSteps,
          guidance_scale: frame.metadata?.guidance || DEFAULT_GUIDANCE,
        },
        onLoadProgress(frame)
      )
    : model == "stable-diffusion-animation"
    ? await api.stableDiffusionAnimation(
        {
          prompt_start: frame.metadata?.prompt || "",
          prompt_end: frame.metadata?.promptEnd || "",
          num_inference_steps: numInferenceSteps,
          num_animation_frames: 3,
          num_interpolation_steps: 2,
          film_interpolation: true,
          output_format: "mp4",
        },
        (event: GenerationProgressEvent) => {
          if ("step" in event) {
            frame.showLoading(animationTimeEstimation(frame).perFrame, `Frame ${event.step + 1}`)
          }
        }
      )
    : await api.stableDiffusion(
        {
          prompt: frame.metadata?.prompt || "",
          negative_prompt: frame.metadata?.negativePrompt,
          num_inference_steps: numInferenceSteps,
          guidance_scale: frame.metadata?.guidance || DEFAULT_GUIDANCE,
          ...(initImageWithNoise
            ? {
                init_image: initImageWithNoise,
                prompt_strength: frame.metadata?.initImage?.promptStrength ?? DEFAULT_PROMPT_STRENGTH,
              }
            : {}),
        },
        onLoadProgress(frame)
      )
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
