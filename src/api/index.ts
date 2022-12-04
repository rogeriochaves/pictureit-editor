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
const adapter : Api = import.meta.env.BACKEND == "replicate" ? TBD() : PictureIt

export default adapter
