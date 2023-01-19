import { useEditor } from "@layerhub-io/react"
import { nanoid } from "nanoid"
import { useCallback, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useRecoilState, useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from "recoil"
import { useDebouncedCallback } from "use-debounce"
import { PictureIt } from "../api/pictureit"
import { IDesign } from "../interfaces/DesignEditor"
import { currentDesignState, currentSceneState, scenesState } from "../state/designEditor"
import {
  changesWithoutExportingState,
  exponentialBackoffSaveRetryState,
  MAX_RETRY_SAVE_TIME,
  saveFileCall,
  waitingForFileSaveDebounceState,
} from "../state/file"
import { paymentRequiredState } from "../state/generateImage"
import { currentUserQuery } from "../state/user"
import { useCallRecoilLazyLoadable, useRecoilValueLazyLoadable } from "../utils/lazySelectorFamily"

export const useAutosaveEffect = () => {
  const { id } = useParams()
  const editor = useEditor()
  const currentScene = useRecoilValue(currentSceneState)
  const currentDesign = useRecoilValue(currentDesignState)
  const saveWithRetries = useSaveWithRetries()
  const setWaitingForFileSaveDebounce = useSetRecoilState(waitingForFileSaveDebounceState)
  const setChangesWithoutExporting = useSetRecoilState(changesWithoutExportingState)

  const debouncedSave = useDebouncedCallback(() => {
    if (!id) return

    setWaitingForFileSaveDebounce(false)
    saveWithRetries(id)
  }, 3000)

  const onModified = useCallback(() => {
    if (!editor || !currentScene) return

    setChangesWithoutExporting(true)

    if (id && PictureIt.isAvailable()) {
      setWaitingForFileSaveDebounce(true)
      debouncedSave()
    }
  }, [currentScene, debouncedSave, editor, id, setChangesWithoutExporting, setWaitingForFileSaveDebounce])

  // On name change
  useEffect(() => {
    // skip first
    return () => {
      onModified()
    }
  }, [currentDesign.name, onModified])

  useEffect(() => {
    if (!editor) return

    editor.canvas.canvas.on("object:modified", onModified)
    editor.canvas.canvas.on("object:added", onModified)
    editor.canvas.canvas.on("object:removed", onModified)

    return () => {
      editor.canvas.canvas.off("object:modified", onModified)
      editor.canvas.canvas.off("object:added", onModified)
      editor.canvas.canvas.off("object:removed", onModified)
    }
  }, [currentScene, editor, id, onModified])
}

export const usePreventCloseIfNotSaved = () => {
  const waitingForFileSaveDebounce = useRecoilValue(waitingForFileSaveDebounceState)
  const changesWithoutExporting = useRecoilValue(changesWithoutExportingState)
  const saveRequest = useRecoilValueLazyLoadable(saveFileCall)
  const user = useRecoilValueLoadable(currentUserQuery)
  const paymentRequired = useRecoilValue(paymentRequiredState)

  const preventClosingIfNotSaved = useCallback(
    (event: BeforeUnloadEvent) => {
      if (PictureIt.isAvailable()) {
        if (
          !paymentRequired &&
          user.state != "hasError" &&
          (waitingForFileSaveDebounce || saveRequest.state != "hasValue")
        ) {
          const message = "Your changes were not saved yet, are you sure you want to close?"
          event.returnValue = message
          return message
        }
      } else {
        if (changesWithoutExporting) {
          const message = "Your changes were not saved yet, export to a file if you don't want to lose your work"
          event.returnValue = message
          return message
        }
      }
    },
    [changesWithoutExporting, paymentRequired, saveRequest.state, user.state, waitingForFileSaveDebounce]
  )

  useEffect(() => {
    window.addEventListener("beforeunload", preventClosingIfNotSaved)
    return () => {
      window.removeEventListener("beforeunload", preventClosingIfNotSaved)
    }
  }, [preventClosingIfNotSaved])
}

const useSaveWithRetries = () => {
  const save = useSave()
  const [exponentialBackoffSaveRetry, setExponentialBackoffSaveRetry] = useRecoilState(exponentialBackoffSaveRetryState)

  const saveWithRetries = useCallback(
    (id: string, backoff?: number) => {
      if (exponentialBackoffSaveRetry) {
        clearTimeout(exponentialBackoffSaveRetry.timeoutRef)
        setExponentialBackoffSaveRetry(undefined)
      }

      save(id)
        .then((result) => {
          setExponentialBackoffSaveRetry(undefined)

          return result
        })
        .catch((err) => {
          const newBackoffTime = backoff ? backoff * 2 : 1000
          if (newBackoffTime >= MAX_RETRY_SAVE_TIME) {
            setExponentialBackoffSaveRetry(undefined)
            throw err
          }

          const timeoutRef = setTimeout(() => {
            saveWithRetries(id, newBackoffTime)
          }, newBackoffTime)

          setExponentialBackoffSaveRetry({
            timeoutRef,
            backoff: newBackoffTime,
          })

          throw err
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [save]
  )

  return saveWithRetries
}

export const useSaveIfNewFile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const save = useSave()
  const [searchParams] = useSearchParams()
  const welcome = searchParams.get("welcome")

  return useDebouncedCallback(() => {
    if (!id) {
      const newId = nanoid()

      save(newId).then((isSaved) => {
        if (isSaved) {
          navigate(`/editor/${newId}${welcome ? "?welcome=true" : ""}`, { replace: true })
        }
      })
    }
  }, 100)
}

export const useSave = () => {
  const scenes = useRecoilValue(scenesState)
  const saveFile = useCallRecoilLazyLoadable(saveFileCall)
  const exportToJSON = useExportToJSON()

  return useCallback(
    (id: string) => {
      const content = exportToJSON()

      return saveFile({
        id: id,
        name: content.name,
        preview: scenes[0].preview || "",
        content: content,
      })
    },
    [exportToJSON, saveFile, scenes]
  )
}

export const useExportToJSON = (): (() => IDesign) => {
  const editor = useEditor()
  const scenes = useRecoilValue(scenesState)
  const currentDesign = useRecoilValue(currentDesignState)

  return useCallback(() => {
    const currentScene = editor!.scene.exportToJSON()

    const updatedScenes = scenes.map((scn) => {
      if (scn.id === currentScene.id) {
        return { ...currentScene, preview: scn.preview }
      }
      return scn
    })

    return {
      ...currentDesign,
      scenes: updatedScenes,
    }
  }, [currentDesign, editor, scenes])
}
