import { ModelTypes } from "@layerhub-io/objects"
import Mocked from "./adapters/mocked"
import PictureIt from "./adapters/pictureit"
import Replicate from "./adapters/replicate"

export enum Capabilities {
  INIT_IMAGE = "init_image",
  NEGATIVE_PROMPT = "negative_prompt",
  ANIMATION_FRAMES = "animation_frames",
}

export type AllGenerationParams = {
  onLoadProgress: LoadProgressCallback

  prompt: string
  negative_prompt?: string
  num_inference_steps?: number
  guidance_scale?: number
  init_image?: string
  prompt_strength?: number

  mask?: string

  skip_timesteps?: number
  seed?: number

  prompt_end?: string
  num_animation_frames?: number
  num_interpolation_steps?: number
  film_interpolation?: boolean
  output_format?: string
}

export type GenerationProgressEvent = { progress: number } | { step: number }
export type LoadProgressCallback = (event: GenerationProgressEvent) => void

export type GenerationOutput = {
  url: string
}

export const ModelCapabilities: { [key in ModelTypes]: Partial<{ [key in Capabilities]: boolean }> } = {
  "stable-diffusion": { [Capabilities.INIT_IMAGE]: true, [Capabilities.NEGATIVE_PROMPT]: true },
  "stable-diffusion-inpainting": { [Capabilities.INIT_IMAGE]: true },
  openjourney: {},
  "stable-diffusion-animation": { [Capabilities.ANIMATION_FRAMES]: true },
}

export interface Api {
  stableDiffusion(params: AllGenerationParams): Promise<GenerationOutput>
  stableDiffusionInpainting(params: AllGenerationParams): Promise<GenerationOutput>
  stableDiffusionAdvanceSteps(params: AllGenerationParams): Promise<GenerationOutput>
  openJourney(params: AllGenerationParams): Promise<GenerationOutput>
  stableDiffusionAnimation(params: AllGenerationParams): Promise<GenerationOutput>
}

const adapter: Api =
  import.meta.env.VITE_ENV_BACKEND == "replicate"
    ? Replicate
    : import.meta.env.VITE_ENV_BACKEND == "mocked"
    ? Mocked
    : PictureIt

export default adapter
