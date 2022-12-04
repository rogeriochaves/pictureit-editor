import {
  Api,
  StableDiffusionInpaintingInput,
  StableDiffusionInpaintingOutput,
  StableDiffusionInput,
  StableDiffusionOutput,
} from "../index"
import { proxyFetch } from "../proxyFetch"

const pictureItFetch = proxyFetch(import.meta.env.VITE_ENV_PICTURE_IT_URL || "https://pictureit.art")

interface IsPictureIt {
  isPictureIt(): true
}

interface UserEndpoints {
  user(): Promise<User | undefined>
}

interface FileEndpoints {
  saveFile(file: PictureItFile): Promise<boolean>
  loadFile(id: string): Promise<PictureItFile>
}

export type PictureItFile = {
  id: string
  name: string
  preview: string
  content: string
}

export type PictureItApi = IsPictureIt & UserEndpoints & FileEndpoints & Api

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

  static async saveFile(file: PictureItFile): Promise<boolean> {
    await postApi(`/api/files/${file.id}`, file)
    return true
  }

  static async loadFile(id: string): Promise<PictureItFile> {
    return await getApi(`/api/files/${id}`)
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
      Accept: "application/json",
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
