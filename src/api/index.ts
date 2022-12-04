import Mocked from "./adapters/mocked"
import PictureIt from "./adapters/pictureit"

export type StableDiffusionInput = {
  prompt: string
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
