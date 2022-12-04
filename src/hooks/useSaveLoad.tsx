import { Editor } from "@layerhub-io/core"
import { useEditor } from "@layerhub-io/react"
import { IScene } from "@layerhub-io/types"
import { debounce } from "lodash"
import { nanoid } from "nanoid"
import { useCallback, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { IDesign } from "../interfaces/DesignEditor"
import { currentDesignState, currentSceneState, scenesState } from "../state/designEditor"
import {
  exponentialBackoffSaveRetryState,
  MAX_RETRY_SAVE_TIME,
  saveFileRequest,
  waitingForFileSaveDebounceState
} from "../state/file"
import { useCallRecoilLazyLoadable, useRecoilValueLazyLoadable } from "../utils/lazySelectorFamily"

export const useAutosaveEffect = () => {
  const { id } = useParams()
  const editor = useEditor()
  const currentScene = useRecoilValue(currentSceneState)
  const saveWithRetries = useSaveWithRetries()
  const setWaitingForFileSaveDebounce = useSetRecoilState(waitingForFileSaveDebounceState)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onModifiedDebounced = useCallback(
    debounce(() => {
      if (!id) return

      setWaitingForFileSaveDebounce(false)
      saveWithRetries(editor, id)
    }, 3000),
    [editor, id, saveWithRetries, setWaitingForFileSaveDebounce]
  )

  const onModified = useCallback(() => {
    setWaitingForFileSaveDebounce(true)
    onModifiedDebounced()
  }, [onModifiedDebounced, setWaitingForFileSaveDebounce])

  useEffect(() => {
    if (!editor || !currentScene || !id) return

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
  const saveRequest = useRecoilValueLazyLoadable(saveFileRequest)

  const preventClosingIfNotSaved = useCallback(
    (event: BeforeUnloadEvent) => {
      if (waitingForFileSaveDebounce || saveRequest.state != "hasValue") {
        const message = "Your changes were not saved yet, are you sure you want to close?"
        event.returnValue = message
        return message
      }
    },
    [saveRequest, waitingForFileSaveDebounce]
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
    (editor: Editor, id: string, backoff?: number) => {
      if (exponentialBackoffSaveRetry) {
        clearTimeout(exponentialBackoffSaveRetry.timeoutRef)
        setExponentialBackoffSaveRetry(undefined)
      }

      save(editor, id)
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
            saveWithRetries(editor, id, newBackoffTime)
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
  const editor = useEditor()
  const save = useSave()

  return useCallback(() => {
    if (!id) {
      const newId = nanoid()

      save(editor, newId).then((isSaved) => {
        if (isSaved) {
          navigate(`/editor/${newId}`, { replace: true })
        }
      })
    }
  }, [editor, id, navigate, save])
}

export const useSave = () => {
  const saveFile = useCallRecoilLazyLoadable(saveFileRequest)
  const exportToJSON = useExportToJSON()

  return useCallback(
    async (editor: Editor, id: string) => {
      const currentScene = editor.scene.exportToJSON()
      const content = exportToJSON(currentScene)
      const preview = (await editor.renderer.render(currentScene)) as string

      return saveFile({
        id: id,
        name: content.name,
        preview: preview,
        content: JSON.stringify(content),
      })
    },
    [exportToJSON, saveFile]
  )
}

export const useExportToJSON = () => {
  const editor = useEditor()
  const scenes = useRecoilValue(scenesState)
  const currentDesign = useRecoilValue(currentDesignState)

  return useCallback(
    (exportedScene?: IScene) => {
      const currentScene = exportedScene || editor.scene.exportToJSON()

      const updatedScenes = scenes.map((scn) => {
        if (scn.id === currentScene.id) {
          return {
            id: currentScene.id,
            layers: currentScene.layers,
            name: currentScene.name,
          }
        }
        return {
          id: scn.id,
          layers: scn.layers,
          name: scn.name,
        }
      })

      if (currentDesign) {
        const graphicTemplate: IDesign = {
          id: currentDesign.id,
          type: "GRAPHIC",
          name: currentDesign.name,
          frame: currentDesign.frame,
          scenes: updatedScenes,
          metadata: {},
          preview: "",
        }

        return graphicTemplate
      } else {
        throw "NO CURRENT DESIGN"
      }
    },
    [currentDesign, editor, scenes]
  )
}
