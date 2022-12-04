import { Editor, nonRenderableLayerTypes } from "@layerhub-io/core"
import ObjectExporter from "@layerhub-io/core/src/utils/object-exporter"
import { IGenerationFrame, ILayer } from "@layerhub-io/types"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fabric } from "fabric"
import api from "../api"
import { extractErrorMessage } from "../api/utils"
import { RemoteData } from "../interfaces/common"
import { addGaussianNoise } from "../utils/noise"

interface GenerationState {
  requests: { [key: string]: RemoteData<{ image: string }> }
  hidePopup: boolean
}

const initialState: GenerationState = {
  requests: {},
  hidePopup: false,
}

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

    const init_image = frame.metadata?.initImage?.fixed
      ? frame.metadata?.initImage?.image
      : await renderInitImage(editor, frame)

    api
      .stableDiffusion({
        prompt: frame.metadata?.prompt || "",
        num_inference_steps,
        guidance_scale: frame.metadata?.guidance || 7.5,
        prompt_strength: 0.8,
        ...(init_image ? { init_image } : {}),
      })
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

export const DEFAULT_NOISE = 2

export const renderInitImage = async (
  editor: Editor,
  generationFrame: fabric.GenerationFrame
): Promise<string | undefined> => {
  const frame = editor.frame.options
  const objectExporter = new ObjectExporter()
  const exported = objectExporter.export(generationFrame.toObject(), frame) as IGenerationFrame
  exported.objects = exported.objects?.filter(
    (object: ILayer) => !object.id.match(/-background$/) && !nonRenderableLayerTypes.includes(object.type)
  )

  if (exported.objects?.length == 0) return

  const canvas = await editor.renderer.renderCanvas({
    id: "",
    frame: { width: 512, height: 512 },
    layers: [exported],
    metadata: {},
  })

  const noise = generationFrame.metadata?.initImage?.noise || DEFAULT_NOISE
  addGaussianNoise(canvas.getContext("2d")!, noise)
  return canvas.toDataURL("image/jpeg")
}
