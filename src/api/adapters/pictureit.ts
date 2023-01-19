import {
  Api,
  StableDiffusionInpaintingInput,
  StableDiffusionInpaintingOutput,
  StableDiffusionInput,
  StableDiffusionAdvanceStepsInput,
  StableDiffusionAdvanceStepsOutput,
  StableDiffusionOutput,
  OpenJourneyInput,
  OpenJourneyOutput,
  StableDiffusionAnimationInput,
  StableDiffusionAnimationOutput,
  LoadProgressCallback,
} from "../index"
import { getApi, postApi } from "../pictureit"
import { parseProgressFromLogs } from "../utils"

const PictureItAdapter: Api = class {
  static async stableDiffusion(
    params: StableDiffusionInput,
    onLoadProgress: LoadProgressCallback
  ): Promise<StableDiffusionOutput> {
    return modelCall("/api/editor/stable_diffusion", params, onLoadProgress)
  }

  static async stableDiffusionInpainting(
    params: StableDiffusionInpaintingInput,
    onLoadProgress: LoadProgressCallback
  ): Promise<StableDiffusionInpaintingOutput> {
    return modelCall("/api/editor/stable_diffusion_inpainting", params, onLoadProgress)
  }

  static async stableDiffusionAdvanceSteps(
    params: StableDiffusionAdvanceStepsInput,
    onLoadProgress: LoadProgressCallback
  ): Promise<StableDiffusionAdvanceStepsOutput> {
    return modelCall("/api/editor/stable_diffusion_advance_steps", params, onLoadProgress)
  }

  static async openJourney(params: OpenJourneyInput, onLoadProgress: LoadProgressCallback): Promise<OpenJourneyOutput> {
    params = { ...params, prompt: `mdjrny-v4 style ${params.prompt}` }

    return modelCall("/api/editor/open_journey", params, onLoadProgress)
  }

  static async stableDiffusionAnimation(
    params: StableDiffusionAnimationInput,
    onLoadProgress: LoadProgressCallback
  ): Promise<StableDiffusionAnimationOutput> {
    return modelCall("/api/editor/stable_diffusion_animation", params, onLoadProgress)
  }
}

async function modelCall(modelPath: string, params: object, onLoadProgress: LoadProgressCallback) {
  const response = await postApi(modelPath, params)
  const result = await checkUntilDone(response, onLoadProgress)

  return result
}

async function checkUntilDone(
  predictionRequest: { id: string },
  onLoadProgress: LoadProgressCallback
): Promise<{ url: string }> {
  const response = await getApi(`/api/editor/progress/${predictionRequest.id}`)

  if (response.status == "succeeded") {
    return { url: response.output[0] as string }
  } else if (response.status == "processing" || response.status == "starting") {
    await sleep(500)
    const progress = response.logs && parseProgressFromLogs(response.logs)
    if (progress) {
      onLoadProgress(progress)
    }
    return checkUntilDone(predictionRequest, onLoadProgress)
  } else {
    throw response.error
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default PictureItAdapter
