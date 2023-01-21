import { atom, RecoilState } from "recoil"
import { lazySelector } from "../utils/lazySelectorFamily"
import { PictureIt, PictureItFile } from "../api/pictureit"

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

export const saveFileCall = lazySelector({
  key: "saveFileCall",
  get: () => async (file: PictureItFile) => {
    if (PictureIt.isAvailable()) {
      return PictureIt.saveFile(file)
    }
  },
})

export const loadFileCall = lazySelector({
  key: "loadFileCall",
  get: () => async (id: string) => {
    if (PictureIt.isAvailable()) {
      const file = await PictureIt.loadFile(id)
      return file
    }
  },
})
