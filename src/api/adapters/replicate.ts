import { AllGenerationParams, Api, GenerationOutput, LoadProgressCallback } from "../index"
import { proxyFetch } from "../proxyFetch"
import { parseProgressFromLogs } from "../utils"

const replicateFetch = proxyFetch("https://api.replicate.com")

const Replicate: Api = class {
  static async stableDiffusion({
    onLoadProgress,
    prompt,
    negative_prompt,
    num_inference_steps,
    guidance_scale,
    init_image,
    prompt_strength,
  }: AllGenerationParams): Promise<GenerationOutput> {
    // https://replicate.com/stability-ai/stable-diffusion
    return callReplicate(
      "27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
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
    // https://replicate.com/andreasjansson/stable-diffusion-inpainting
    return callReplicate(
      "8eb2da8345bee796efcd925573f077e36ed5fb4ea3ba240ef70c23cf33f0d848",
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

  static async openJourney({
    onLoadProgress,
    prompt,
    num_inference_steps,
    guidance_scale,
  }: AllGenerationParams): Promise<GenerationOutput> {
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
  }
}

async function callReplicate(modelId: string, params: object, onLoadProgress: LoadProgressCallback) {
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
  onLoadProgress: LoadProgressCallback
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
      onLoadProgress(progress)
    }
    return checkUntilDone(predictionRequest, onLoadProgress)
  } else {
    throw json.error
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default Replicate
