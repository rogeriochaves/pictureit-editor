import Mocked from "./adapters/mocked"
import PictureIt from "./adapters/pictureit"

export type StableDiffusionInput = {
  prompt: string,
  num_inference_steps?: number,
  init_image?: string,
  guidance_scale?: number,
  prompt_strength?: number
}

export type StableDiffusionOutput = {
  url: string
}

export interface Api {
  stableDiffusion(params: StableDiffusionInput): Promise<StableDiffusionOutput>
}

const TBD = (): any => {
  throw "Not implemented yet"
}
const adapter: Api =
  import.meta.env.VITE_BACKEND == "replicate" ? TBD() : import.meta.env.VITE_BACKEND == "mocked" ? Mocked : PictureIt

export default adapter
