import api from "../api"
import { atom, RecoilState } from "recoil"
import { PictureItFile } from "../api/adapters/pictureit"
import { lazySelector } from "../utils/lazySelectorFamily"

export const MAX_RETRY_SAVE_TIME = 5 * 60 * 1000 // 5 minutes

export type BackoffRetry = {
  timeoutRef: NodeJS.Timeout
  backoff: number
}

export const exponentialBackoffSaveRetryState: RecoilState<BackoffRetry | undefined> = atom({
  key: "exponentialBackoffSaveRetryState",
  default: undefined as BackoffRetry | undefined,
})

export const waitingForFileSaveDebounceState: RecoilState<boolean> = atom({
  key: "waitingForFileSaveDebounceState",
  default: false,
})

export const changesWithoutExportingState: RecoilState<boolean> = atom({
  key: "changesWithoutExportingState",
  default: false,
})

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
