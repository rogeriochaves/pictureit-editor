import { ModelTypes } from "@layerhub-io/objects"
import Mocked from "./adapters/mocked"
import PictureIt, { PictureItApi } from "./adapters/pictureit"
import Replicate from "./adapters/replicate"

export enum Capabilities {
  INIT_IMAGE = "init_image",
  NEGATIVE_PROMPT = "negative_prompt",
  ANIMATION_FRAMES = "animation_frames",
}

export const ModelCapabilities: { [key in ModelTypes]: Partial<{ [key in Capabilities]: boolean }> } = {
  "stable-diffusion": { [Capabilities.INIT_IMAGE]: true, [Capabilities.NEGATIVE_PROMPT]: true },
  "stable-diffusion-inpainting": { [Capabilities.INIT_IMAGE]: true },
  openjourney: {},
  "stable-diffusion-animation": { [Capabilities.ANIMATION_FRAMES]: true },
}

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

export type GenerationProgressEvent = { progress: number } | { step: number }
export type LoadProgressCallback = (event: GenerationProgressEvent) => void

export interface Api {
  stableDiffusion(params: StableDiffusionInput, onLoadProgress: LoadProgressCallback): Promise<StableDiffusionOutput>
  stableDiffusionInpainting(
    params: StableDiffusionInpaintingInput,
    onLoadProgress: LoadProgressCallback
  ): Promise<StableDiffusionInpaintingOutput>
  stableDiffusionAdvanceSteps(
    params: StableDiffusionAdvanceStepsInput,
    onLoadProgress: LoadProgressCallback
  ): Promise<StableDiffusionAdvanceStepsOutput>
  openJourney(params: OpenJourneyInput, onLoadProgress: LoadProgressCallback): Promise<OpenJourneyOutput>
  stableDiffusionAnimation(
    params: StableDiffusionAnimationInput,
    onLoadProgress: LoadProgressCallback
  ): Promise<StableDiffusionAnimationOutput>
}

const adapter: PictureItApi | Api =
  import.meta.env.VITE_ENV_BACKEND == "replicate"
    ? Replicate
    : import.meta.env.VITE_ENV_BACKEND == "mocked"
    ? Mocked
    : PictureIt

export default adapter

export const isPictureIt = () => "isPictureIt" in adapter
