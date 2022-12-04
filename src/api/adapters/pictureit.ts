import {
  Api,
  StableDiffusionInpaintingInput,
  StableDiffusionInpaintingOutput,
  StableDiffusionInput,
  StableDiffusionOutput,
} from "../index"
import { proxyFetch } from "../proxyFetch"

const pictureItFetch = proxyFetch("https://pictureit.art")

const PictureIt: Api = class {
  static async stableDiffusion(params: StableDiffusionInput): Promise<StableDiffusionOutput> {
    return callApi("/api/editor/stable_diffusion", params)
  }

  static async stableDiffusionInpainting(
    params: StableDiffusionInpaintingInput
  ): Promise<StableDiffusionInpaintingOutput> {
    return callApi("/api/editor/stable_diffusion_inpainting", params)
  }
}

async function callApi(url: string, params: object) {
  const response = await pictureItFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  })
  const json = await response.json()
  if (json.error) {
    throw json
  }

  return json
}

export default PictureIt
