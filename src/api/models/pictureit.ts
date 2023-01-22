import { getApi, PictureIt, postApi } from "../pictureit"
import { GenerationModel, LoadProgressCallback, ModelCapability } from "../types"
import { parseProgressFromLogs } from "../utils"

const pictureItModel = {
  enabled: PictureIt.isAvailable(),
  setupInstructions: "",
}

const stableDiffusion: GenerationModel<
  [
    ModelCapability.BASIC,
    ModelCapability.PROGRESS_REPORTING,
    ModelCapability.GUIDANCE_SCALE,
    ModelCapability.INIT_IMAGE,
    ModelCapability.NEGATIVE_PROMPT,
    ModelCapability.ADVANCE
  ]
> = {
  ...pictureItModel,
  name: "Stable Diffusion",
  call: ({
    onLoadProgress,
    prompt,
    num_inference_steps,
    guidance_scale,
    negative_prompt,
    init_image,
    prompt_strength,
    skip_timesteps,
    seed,
  }) => {
    if (skip_timesteps) {
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
    return modelCall(
      "/api/editor/stable_diffusion",
      {
        prompt,
        num_inference_steps,
        guidance_scale,
        negative_prompt,
        init_image,
        prompt_strength,
      },
      onLoadProgress
    )
  },
  capabilities: [
    ModelCapability.BASIC,
    ModelCapability.PROGRESS_REPORTING,
    ModelCapability.GUIDANCE_SCALE,
    ModelCapability.INIT_IMAGE,
    ModelCapability.NEGATIVE_PROMPT,
    ModelCapability.ADVANCE,
  ],
}

const stableDiffusionInpainting: GenerationModel<
  [
    ModelCapability.BASIC,
    ModelCapability.PROGRESS_REPORTING,
    ModelCapability.GUIDANCE_SCALE,
    ModelCapability.INIT_IMAGE,
    ModelCapability.INPAINTING
  ]
> = {
  ...pictureItModel,
  name: "Stable Diffusion Inpainting",
  call: ({ onLoadProgress, prompt, num_inference_steps, guidance_scale, init_image, mask }) => {
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
  },
  capabilities: [
    ModelCapability.BASIC,
    ModelCapability.PROGRESS_REPORTING,
    ModelCapability.GUIDANCE_SCALE,
    ModelCapability.INIT_IMAGE,
    ModelCapability.INPAINTING,
  ],
}

const stableDiffusionOpenJourney: GenerationModel<
  [ModelCapability.BASIC, ModelCapability.PROGRESS_REPORTING, ModelCapability.GUIDANCE_SCALE]
> = {
  ...pictureItModel,
  name: "Open Journey",
  call: ({ onLoadProgress, prompt, num_inference_steps, guidance_scale }) => {
    return modelCall(
      "/api/editor/open_journey",
      {
        prompt: `mdjrny-v4 style ${prompt}`,
        num_inference_steps,
        guidance_scale,
      },
      onLoadProgress
    )
  },
  capabilities: [ModelCapability.BASIC, ModelCapability.PROGRESS_REPORTING, ModelCapability.GUIDANCE_SCALE],
}

const stableDiffusionAnimation: GenerationModel<
  [ModelCapability.BASIC, ModelCapability.PROGRESS_REPORTING, ModelCapability.ANIMATION_FRAMES]
> = {
  ...pictureItModel,
  name: "Stable Diffusion Animation",
  call: ({
    onLoadProgress,
    prompt,
    num_inference_steps,
    prompt_end,
    num_animation_frames,
    num_interpolation_steps,
    film_interpolation,
    output_format,
  }) => {
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
  },
  capabilities: [ModelCapability.BASIC, ModelCapability.PROGRESS_REPORTING, ModelCapability.ANIMATION_FRAMES],
}

export const models = {
  stableDiffusion,
  stableDiffusionInpainting,
  stableDiffusionOpenJourney,
  stableDiffusionAnimation,
}

async function modelCall(modelPath: string, params: object, onLoadProgress: LoadProgressCallback | undefined) {
  const response = await postApi(modelPath, params)
  const result = await checkUntilDone(response, onLoadProgress)

  return result
}

async function checkUntilDone(
  predictionRequest: { id: string },
  onLoadProgress: LoadProgressCallback | undefined
): Promise<{ url: string }> {
  const response = await getApi(`/api/editor/progress/${predictionRequest.id}`)

  if (response.status == "succeeded") {
    return { url: response.output[0] as string }
  } else if (response.status == "processing" || response.status == "starting") {
    await sleep(500)
    const progress = response.logs && parseProgressFromLogs(response.logs)
    if (progress) {
      onLoadProgress?.(progress)
    }
    return checkUntilDone(predictionRequest, onLoadProgress)
  } else {
    throw response.error
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
