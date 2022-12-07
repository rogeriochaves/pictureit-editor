import Mocked from "./adapters/mocked"
import PictureIt, { PictureItApi } from "./adapters/pictureit"
import Replicate from "./adapters/replicate"

export type StableDiffusionInput = {
  prompt: string
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

export type StableDiffusionInpaintingOutput = {
  url: string
}

export interface Api {
  stableDiffusion(params: StableDiffusionInput): Promise<StableDiffusionOutput>
  stableDiffusionInpainting(params: StableDiffusionInpaintingInput): Promise<StableDiffusionInpaintingOutput>
}

const adapter: PictureItApi | Api =
  import.meta.env.VITE_ENV_BACKEND == "replicate"
    ? Replicate
    : import.meta.env.VITE_ENV_BACKEND == "mocked"
    ? Mocked
    : PictureIt

export default adapter

export const isPictureIt = () => "isPictureIt" in adapter
