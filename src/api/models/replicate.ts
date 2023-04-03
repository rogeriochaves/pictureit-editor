import { proxyFetch } from "../proxyFetch"
import { GenerationModel, LoadProgressCallback, ModelCapability } from "../types"
import { parseProgressFromLogs } from "../utils"

const replicateFetch = proxyFetch("https://api.replicate.com")

const replicateModel = {
  enabled: !!import.meta.env.VITE_ENV_REPLICATE_TOKEN,
  setupInstructions: "Set VITE_ENV_REPLICATE_TOKEN to enable this model",
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
  ...replicateModel,
  name: "[Replicate] Stable Diffusion",
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
      // https://replicate.com/devxpy/glid-3-xl-stable
      return callReplicate(
        "7d6a340e1815acf2b3b2ee0fcaf830fbbcd8697e9712ca63d81930c60484d2d7",
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
    // https://replicate.com/stability-ai/stable-diffusion
    return callReplicate(
      "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
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
  ...replicateModel,
  name: "[Replicate] Stable Diffusion Inpainting",
  call: ({ onLoadProgress, prompt, num_inference_steps, guidance_scale, init_image, mask }) => {
    if (!mask || !init_image) {
      throw "Nothing to inpaint, use inpaint tool or a different model"
    }
    // https://replicate.com/andreasjansson/stable-diffusion-inpainting
    return callReplicate(
      "e490d072a34a94a11e9711ed5a6ba621c3fab884eda1665d9d3a282d65a21180",
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
  ...replicateModel,
  name: "[Replicate] Open Journey",
  call: ({ onLoadProgress, prompt, num_inference_steps, guidance_scale }) => {
    // https://replicate.com/prompthero/openjourney
    return callReplicate(
      "9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb",
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
  ...replicateModel,
  name: "[Replicate] Stable Diffusion Animation",
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
    // https://replicate.com/andreasjansson/stable-diffusion-animation
    return callReplicate(
      "ca1f5e306e5721e19c473e0d094e6603f0456fe759c10715fcd6c1b79242d4a5",
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

async function callReplicate(modelId: string, params: object, onLoadProgress: LoadProgressCallback | undefined) {
  if (!import.meta.env.VITE_ENV_REPLICATE_TOKEN) {
    console.error(
      "VITE_ENV_REPLICATE_TOKEN env var is not set, calls to the backend will fail, read more about it on the README of the project"
    )
  }
  const response = await replicateFetch("/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${import.meta.env.VITE_ENV_REPLICATE_TOKEN}`,
    },
    body: JSON.stringify({
      version: modelId,
      input: params,
    }),
  })
  const predictionRequest = await response.json()
  if (predictionRequest.error) {
    throw predictionRequest
  }

  const result = await checkUntilDone(predictionRequest, onLoadProgress)

  return result
}

async function checkUntilDone(
  predictionRequest: { urls: { get: string } },
  onLoadProgress: LoadProgressCallback | undefined
): Promise<{ url: string }> {
  const {
    urls: { get: getUrl },
  } = predictionRequest

  const response = await replicateFetch(getUrl.replace("https://api.replicate.com", ""), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${import.meta.env.VITE_ENV_REPLICATE_TOKEN}`,
    },
  })
  const json = await response.json()
  if (json.status == "succeeded") {
    return { url: json.output[0] as string }
  } else if (json.status == "processing" || json.status == "starting") {
    await sleep(500)
    const progress = json.logs && parseProgressFromLogs(json.logs)
    if (progress) {
      onLoadProgress?.(progress)
    }
    return checkUntilDone(predictionRequest, onLoadProgress)
  } else {
    throw json.error
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
