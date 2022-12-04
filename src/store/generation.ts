import { Editor, nonRenderableLayerTypes, LayerType } from "@layerhub-io/core"
import ObjectExporter from "@layerhub-io/core/src/utils/object-exporter"
import { IGenerationFrame, ILayer } from "@layerhub-io/types"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fabric } from "fabric"
import api from "../api"
import { extractErrorMessage } from "../api/utils"
import { RemoteData } from "../interfaces/common"
import { canvasFromImage } from "../utils/canvas-from-image"
import { paintItBlack } from "../utils/clip-mask"
import { addGaussianNoise } from "../utils/noise"

interface GenerationState {
  requests: { [key: string]: RemoteData<{ image: string }> }
  hidePopup: boolean
}

const initialState: GenerationState = {
  requests: {},
  hidePopup: false,
}

export const DEFAULT_NOISE = 0
export const DEFAULT_PROMPT_STRENGTH = 0.8
export const DEFAULT_GUIDANCE = 7.5

export const generationSlice = createSlice({
  name: "generation",
  initialState,
  reducers: {
    setGenerationRequest: (state, { payload }: PayloadAction<{ id: string; state: RemoteData<{ image: string }> }>) => {
      state.requests[payload.id] = payload.state
    },
    setHidePopup: (state, { payload }: PayloadAction<boolean>) => {
      state.hidePopup = payload
    },
  },
})

export const { setGenerationRequest, setHidePopup } = generationSlice.actions
export const generationReducer = generationSlice.reducer

export const generateImage = createAsyncThunk<
  void,
  { id: string; frame: fabric.GenerationFrame; editor: Editor },
  { rejectValue: Record<string, string[]> }
>("generation/generateImage", async ({ id, frame, editor }, { rejectWithValue, dispatch }) => {
  try {
    dispatch(setGenerationRequest({ id, state: { state: "LOADING" } }))

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

    const call =
      initImageWithNoise && clipMask
        ? api.stableDiffusionInpainting({
            prompt: frame.metadata?.prompt || "",
            num_inference_steps,
            guidance_scale: frame.metadata?.guidance || DEFAULT_GUIDANCE,
            image: initImageWithNoise,
            mask: clipMask,
          })
        : api.stableDiffusion({
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

    call
      .then(async (result) => {
        if (result.url) {
          await frame.setImage(result.url)
          editor.objects.afterAddHook(frame as fabric.Object, false)

          dispatch(setGenerationRequest({ id, state: { state: "SUCCESS", data: { image: result.url } } }))
        }
      })
      .catch(async (error) => {
        dispatch(setGenerationRequest({ id, state: { state: "ERROR" } }))
        frame.showError(await extractErrorMessage(error))
        editor.objects.afterAddHook(frame as fabric.Object, false)
      })
  } catch (err) {
    return rejectWithValue((err as any).response?.data?.error.data || null)
  }
})

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
    addGaussianNoise(initImageCanvas.getContext("2d")!, generationFrame.metadata?.initImage?.noise ?? DEFAULT_NOISE)
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
  return editor.canvas.canvas.getObjects().filter((anotherFrame) => {
    return (
      anotherFrame != generationFrame &&
      anotherFrame instanceof fabric.GenerationFrame &&
      generationFrame.intersectsWithObject(anotherFrame as fabric.Object)
    )
  }) as fabric.GenerationFrame[]
}
