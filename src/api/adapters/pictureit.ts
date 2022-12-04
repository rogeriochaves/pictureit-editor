import { Api, StableDiffusionInput, StableDiffusionOutput } from "../index"
import { proxyFetch } from "../proxyFetch"

const pictureItFetch = proxyFetch("https://pictureit.art")

const PictureIt: Api = class {
  static async stableDiffusion(params: StableDiffusionInput): Promise<StableDiffusionOutput> {
    const response = await pictureItFetch("/api/editor/stable_diffusion", {
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
}

export default PictureIt
