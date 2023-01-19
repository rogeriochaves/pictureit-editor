import { Api, LoadProgressCallback, AllGenerationParams, GenerationOutput } from "../index"
import { getApi, postApi } from "../pictureit"
import { parseProgressFromLogs } from "../utils"

const PictureItAdapter: Api = class {
  static async stableDiffusion({
    onLoadProgress,
    prompt,
    negative_prompt,
    num_inference_steps,
    guidance_scale,
    init_image,
    prompt_strength,
  }: AllGenerationParams): Promise<GenerationOutput> {
    return modelCall(
      "/api/editor/stable_diffusion",
      {
        prompt,
        negative_prompt,
        num_inference_steps,
        guidance_scale,
        init_image,
        prompt_strength,
      },
      onLoadProgress
    )
  }

  static async stableDiffusionInpainting({
    onLoadProgress,
    prompt,
    num_inference_steps,
    guidance_scale,
    init_image,
    mask,
  }: AllGenerationParams): Promise<GenerationOutput> {
    return modelCall(
      "/api/editor/stable_diffusion_inpainting",
      {
        prompt,
        num_inference_steps,
        guidance_scale,
        image: init_image,
        mask,
      },
      onLoadProgress
    )
  }

  static async stableDiffusionAdvanceSteps({
    onLoadProgress,
    prompt,
    init_image,
    num_inference_steps,
    skip_timesteps,
    seed,
  }: AllGenerationParams): Promise<GenerationOutput> {
    return modelCall(
      "/api/editor/stable_diffusion_advance_steps",
      {
        prompt,
        init_image,
        num_inference_steps,
        skip_timesteps,
        seed,
      },
      onLoadProgress
    )
  }

  static async openJourney({
    onLoadProgress,
    prompt,
    num_inference_steps,
    guidance_scale,
  }: AllGenerationParams): Promise<GenerationOutput> {
    return modelCall(
      "/api/editor/open_journey",
      {
        prompt: `mdjrny-v4 style ${prompt}`,
        num_inference_steps,
        guidance_scale,
      },
      onLoadProgress
    )
  }

  static async stableDiffusionAnimation({
    onLoadProgress,
    prompt,
    prompt_end,
    num_inference_steps,
    num_animation_frames,
    num_interpolation_steps,
    film_interpolation,
    output_format,
  }: AllGenerationParams): Promise<GenerationOutput> {
    return modelCall(
      "/api/editor/stable_diffusion_animation",
      {
        prompt_start: prompt,
        prompt_end,
        num_inference_steps,
        num_animation_frames,
        num_interpolation_steps,
        film_interpolation,
        output_format,
      },
      onLoadProgress
    )
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
