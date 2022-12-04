import Mocked from "./adapters/mocked"
import PictureIt from "./adapters/pictureit"

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

const TBD = (): any => {
  throw "Not implemented yet"
}
const adapter: Api =
  import.meta.env.VITE_ENV_BACKEND == "replicate"
    ? TBD()
    : import.meta.env.VITE_ENV_BACKEND == "mocked"
    ? Mocked
    : PictureIt

export default adapter
