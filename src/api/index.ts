import Mocked from "./adapters/mocked"
import PictureIt, { PictureItApi } from "./adapters/pictureit"
import Replicate from "./adapters/replicate"

export type StableDiffusionInput = {
  prompt: string
  negative_prompt?: string
  num_inference_steps?: number
  guidance_scale?: number
  init_image?: string
  prompt_strength?: number
}

export type StableDiffusionOutput = {
  url: string
}

export type StableDiffusionInpaintingInput = {
  prompt: string
  num_inference_steps?: number
  guidance_scale?: number
  image?: string
  mask?: string
}

export type StableDiffusionInpaintingOutput = StableDiffusionOutput

export type StableDiffusionAdvanceStepsInput = {
  prompt: string
  init_image: string
  num_inference_steps: number
  skip_timesteps: number
  seed: number
}

export type StableDiffusionAdvanceStepsOutput = StableDiffusionOutput

export type OpenJourneyInput = {
  prompt: string
  num_inference_steps: number
  guidance_scale?: number
}

export type OpenJourneyOutput = StableDiffusionOutput

export type StableDiffusionAnimationInput = {
  prompt_start: string
  prompt_end: string
  num_inference_steps: number
  num_animation_frames: number
  num_interpolation_steps: number
  film_interpolation: boolean
  output_format: string
}

export type StableDiffusionAnimationOutput = StableDiffusionOutput

export type GenerationProgressEvent = { progress: number }
export type LoadProgressCallback = (event: GenerationProgressEvent) => void

export interface Api {
  stableDiffusion(params: StableDiffusionInput, onLoadProgress: LoadProgressCallback): Promise<StableDiffusionOutput>
  stableDiffusionInpainting(params: StableDiffusionInpaintingInput, onLoadProgress: LoadProgressCallback): Promise<StableDiffusionInpaintingOutput>
  stableDiffusionAdvanceSteps(params: StableDiffusionAdvanceStepsInput, onLoadProgress: LoadProgressCallback): Promise<StableDiffusionAdvanceStepsOutput>
  openJourney(params: OpenJourneyInput, onLoadProgress: LoadProgressCallback): Promise<OpenJourneyOutput>
  stableDiffusionAnimation(params: StableDiffusionAnimationInput): Promise<StableDiffusionAnimationOutput>
}

const adapter: PictureItApi | Api =
  import.meta.env.VITE_ENV_BACKEND == "replicate"
    ? Replicate
    : import.meta.env.VITE_ENV_BACKEND == "mocked"
    ? Mocked
    : PictureIt

export default adapter

export const isPictureIt = () => "isPictureIt" in adapter
