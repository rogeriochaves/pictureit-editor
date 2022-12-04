import api from "../api"
import { PictureItFile } from "../api/adapters/pictureit"
import { lazySelector } from "../utils/lazySelectorFamily"

export const saveFileRequest = lazySelector({
  key: "saveFileRequest",
  get: () => async (file: PictureItFile) => {
    if ("isPictureIt" in api) {
      return api.saveFile(file)
    }
  },
})

export const loadFileRequest = lazySelector({
  key: "loadFileRequest",
  get: () => async (id: string) => {
    if ("isPictureIt" in api) {
      const file = await api.loadFile(id)
      return file
    }
  },
})
