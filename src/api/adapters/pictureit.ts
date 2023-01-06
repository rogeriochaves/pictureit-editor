import {
  Api,
  StableDiffusionInpaintingInput,
  StableDiffusionInpaintingOutput,
  StableDiffusionInput,
  StableDiffusionAdvanceStepsInput,
  StableDiffusionAdvanceStepsOutput,
  StableDiffusionOutput,
  OpenJourneyInput,
  OpenJourneyOutput,
  StableDiffusionAnimationInput,
  StableDiffusionAnimationOutput,
} from "../index"
import { proxyFetch } from "../proxyFetch"

export const PICTURE_IT_URL = import.meta.env.VITE_ENV_PICTURE_IT_URL || "https://pictureit.art"

const pictureItFetch = proxyFetch(PICTURE_IT_URL)

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

interface PublishEndpoints {
  publish(title: string, image: string): Promise<{ url: string }>
}

interface TagSuggestions {
  tagSuggestions(prompt: string): Promise<string[]>
}

export type PictureItFile = {
  id: string
  name: string
  preview: string
  content: object
}

export type PictureItApi = IsPictureIt & UserEndpoints & FileEndpoints & PublishEndpoints & TagSuggestions & Api

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

  static async stableDiffusionAdvanceSteps(
    params: StableDiffusionAdvanceStepsInput
  ): Promise<StableDiffusionAdvanceStepsOutput> {
    return postApi("/api/editor/stable_diffusion_advance_steps", params)
  }

  static async openJourney(params: OpenJourneyInput): Promise<OpenJourneyOutput> {
    params = { ...params, prompt: `mdjrny-v4 style ${params.prompt}` }

    return postApi("/api/editor/open_journey", params)
  }

  static async stableDiffusionAnimation(
    params: StableDiffusionAnimationInput
  ): Promise<StableDiffusionAnimationOutput> {
    return postApi("/api/editor/stable_diffusion_animation", params)
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
    const file = await getApi(`/api/files/${id}`).catch((err) => {
      if (err.status && err.status == 401) {
        document.location = `${PICTURE_IT_URL}/login?return_to=${encodeURIComponent(document.location.toString())}`

        // small delay to display the loading while the redirect happens
        return new Promise((resolve) => setTimeout(resolve, 3000))
      }

      throw err
    })

    return file
  }

  static async publish(title: string, image: string) {
    return await postApi(`/api/picture/publish`, { title, image })
  }

  static async tagSuggestions(prompt: string) {
    return await getApi(`/api/tag_suggestions?prompt=${encodeURIComponent(prompt)}`)
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
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
  const json = await response.json()
  if (json.error) {
    throw json
  }

  return json
}

export default PictureIt
