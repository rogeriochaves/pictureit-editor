import { Editor, nonRenderableLayerTypes } from "@layerhub-io/core"
import ObjectExporter from "@layerhub-io/core/src/utils/object-exporter"
import { IGenerationFrame, ILayer } from "@layerhub-io/types"
import { fabric } from "fabric"
import { atom } from "recoil"
import api from "../api"
import { extractErrorMessage } from "../api/utils"
import { canvasFromImage } from "../utils/canvas-from-image"
import { paintItBlack } from "../utils/clip-mask"
import { lazySelectorFamily } from "../utils/lazySelectorFamily"
import { addGaussianNoise } from "../utils/noise"
import { currentUserQuery } from "./user"

export const DEFAULT_PROMPT_STRENGTH = 0.8
export const DEFAULT_GUIDANCE = 7.5

export const generateImageCall = lazySelectorFamily({
  key: "generateImageCall",
  get:
    ({ set, refresh }) =>
    async (params: { frame: fabric.GenerationFrame; editor: Editor }) => {
      try {
        await generateImage(params)
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

const generateImage = async ({ frame, editor }: { frame: fabric.GenerationFrame; editor: Editor }) => {
  try {
    const num_inference_steps = frame.metadata?.steps || 50
    frame.showLoading((4 + num_inference_steps * 0.1) * 1000)

    const [initImage, initImageWithNoise] = await renderInitImage(editor, frame, true)
    const clipMask = await renderClipMask(editor, frame)

    if (frame.metadata) {
      frame.metadata.initImage = {
        ...(frame.metadata?.initImage || {}),
        fixed: true,
        image: initImage,
      }
    }

    const result =
      initImageWithNoise && clipMask
        ? await api.stableDiffusionInpainting({
            prompt: frame.metadata?.prompt || "",
            num_inference_steps,
            guidance_scale: frame.metadata?.guidance || DEFAULT_GUIDANCE,
            image: initImageWithNoise,
            mask: clipMask,
          })
        : await api.stableDiffusion({
            prompt: frame.metadata?.prompt || "",
            num_inference_steps,
            guidance_scale: frame.metadata?.guidance || DEFAULT_GUIDANCE,
            ...(initImageWithNoise
              ? {
                  init_image: initImageWithNoise,
                  prompt_strength: frame.metadata?.initImage?.promptStrength ?? DEFAULT_PROMPT_STRENGTH,
                }
              : {}),
          })

    if (result.url) {
      await frame.setImage(result.url)
      editor.objects.afterAddHook(frame as fabric.Object, false)

      return { image: result.url }
    }

    throw "no url found on the result"
  } catch (err) {
    frame.showError(await extractErrorMessage(err))
    editor.objects.afterAddHook(frame as fabric.Object, false)

    throw err
  }
}

export const renderInitImage = async (
  editor: Editor,
  generationFrame: fabric.GenerationFrame,
  renderInitImage: boolean
): Promise<[string | undefined, string | undefined]> => {
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

  return [initImage, initImageWithNoise]
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
  const overlappingFrames = getOverlappingFrames(editor, generationFrame)

  const canvas = await exportFrameToCanvas(editor, generationFrame, overlappingFrames)
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

const getOverlappingFrames = (editor: Editor, generationFrame: fabric.GenerationFrame) => {
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
