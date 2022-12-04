import { Editor } from "@layerhub-io/core"
import { useEditor } from "@layerhub-io/react"
import { IScene } from "@layerhub-io/types"
import { nanoid } from "nanoid"
import { useCallback, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useRecoilValue } from "recoil"
import { IDesign } from "../interfaces/DesignEditor"
import { currentDesignState, scenesState } from "../state/designEditor"
import { saveFileRequest } from "../state/file"
import { useRecoilLazyLoadable } from "../utils/lazySelectorFamily"

export const useAutosaveEffect = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const editor = useEditor()
  const save = useSave()

  useEffect(() => {
    // TODO: check if picture it
    if (!id && editor) {
      const newId = nanoid()

      save(editor, newId).then((isSaved) => {
        if (isSaved) {
          navigate(`/editor/${newId}`, { replace: true })
        }
      })
    }
  }, [id, editor, save, navigate])

  return []
}

export const useSave = () => {
  const [_saveRequest, saveFile] = useRecoilLazyLoadable(saveFileRequest)
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
