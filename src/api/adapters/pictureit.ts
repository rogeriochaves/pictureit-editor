import {
  Api,
  StableDiffusionInpaintingInput,
  StableDiffusionInpaintingOutput,
  StableDiffusionInput,
  StableDiffusionOutput,
} from "../index"
import { proxyFetch } from "../proxyFetch"

const pictureItFetch = proxyFetch("https://pictureit.art")

interface IsPictureIt {
  isPictureIt(): true
}

interface UserEndpoints {
  user(): Promise<User | undefined>
}

export type PictureItApi = IsPictureIt & UserEndpoints & Api

export interface User {
  email: string
  name: string
}

const PictureIt: PictureItApi = class {
  static async stableDiffusion(params: StableDiffusionInput): Promise<StableDiffusionOutput> {
    return postApi("/api/editor/stable_diffusion", params)
  }

  static async stableDiffusionInpainting(
    params: StableDiffusionInpaintingInput
  ): Promise<StableDiffusionInpaintingOutput> {
    return postApi("/api/editor/stable_diffusion_inpainting", params)
  }

  static async user(): Promise<User | undefined> {
    const result = await getApi("/api/user")
    if ("email" in result) {
      return result
    }

    throw "signed out"
  }

  static isPictureIt(): true {
    return true
  }
}

async function postApi(url: string, params: object) {
  const response = await pictureItFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
    credentials: "include",
  })
  const json = await response.json()
  if (json.error) {
    throw json
  }

  return json
}

async function getApi(url: string) {
  const response = await pictureItFetch(url, {
    method: "GET",
    credentials: "include",
  })
  const json = await response.json()
  if (json.error) {
    throw json
  }

  return json
}

export default PictureIt
