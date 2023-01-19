import { proxyFetch } from "./proxyFetch"

export const PICTURE_IT_URL = import.meta.env.VITE_ENV_PICTURE_IT_URL || "https://pictureit.art"

const pictureItFetch = proxyFetch(PICTURE_IT_URL)

export type PictureItApi = {
  isAvailable(): boolean
  user(): Promise<User | undefined>
  saveFile(file: PictureItFile): Promise<boolean>
  loadFile(id: string): Promise<PictureItFile>
  publish(title: string, image: string, video?: string, videoLoop?: boolean): Promise<{ url: string }>
  tagSuggestions(prompt: string): Promise<string[]>
}

export type PictureItFile = {
  id: string
  name: string
  preview: string
  content: object
}

export interface User {
  email: string
  name: string
}

export const PictureIt: PictureItApi = class {
  static isAvailable(): true {
    return import.meta.env.VITE_ENV_PICTURE_IT
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

  static async publish(title: string, image: string, video?: string, videoLoop?: boolean) {
    return await postApi(`/api/picture/publish`, { title, image, video, video_loop: videoLoop })
  }

  static async tagSuggestions(prompt: string) {
    return await getApi(`/api/tag_suggestions?prompt=${encodeURIComponent(prompt)}`)
  }
}

export async function postApi(url: string, params: object) {
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

export async function getApi(url: string) {
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