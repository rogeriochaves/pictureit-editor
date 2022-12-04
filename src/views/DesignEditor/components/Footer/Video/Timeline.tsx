import { useEditor } from "@layerhub-io/react"
import { IScene } from "@layerhub-io/types"
import { useTimer } from "@layerhub-io/use-timer"
import { useStyletron } from "baseui"
import { Block } from "baseui/block"
import { nanoid } from "nanoid"
import React from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import Add from "~/components/Icons/Add"
import { getDefaultTemplate } from "~/constants/design-editor"
import { contextMenuTimelineRequestState, currentDesignState, currentPreviewState, currentSceneState, scenesState } from "~/state/designEditor"
import { findSceneIndexByTime } from "~/views/DesignEditor/utils/scenes"
import TimelineContextMenu from "./TimelineContextMenu"
import TimelineControl from "./TimelineControl"
import TimelineItems from "./TimelineItems"
import TimeMarker from "./TimeMarker"

const Timeline = () => {
  const { time, setTime, status } = useTimer()
  const [scenes, setScenes] = useRecoilState(scenesState)
  const [currentScene, setCurrentScene] = useRecoilState(currentSceneState)
  const [currentDesign, setCurrentDesign] = useRecoilState(currentDesignState)
  const setCurrentPreview = useSetRecoilState(currentPreviewState)
  const contextMenuTimelineRequest = useRecoilValue(contextMenuTimelineRequestState)
  const editor = useEditor()
  const [css] = useStyletron()

  React.useEffect(() => {
    const watcher = async () => {
      const updatedTemplate = editor.scene.exportToJSON()
      const updatedPreview = (await editor.renderer.render(updatedTemplate)) as any
      setCurrentPreview(updatedPreview)
    }
    if (editor) {
      editor.on("history:changed", watcher)
    }
    return () => {
      if (editor) {
        editor.off("history:changed", watcher)
      }
    }
  }, [editor])

  React.useEffect(() => {
    if (editor) {
      if (currentScene) {
        updateCurrentScene(currentScene)
      } else {
        getDefaultTemplate(editor.canvas.canvas, {
          width: 1200,
          height: 1200,
        })
          .then((defaultTemplate) => {
            // SET INITIAL DURATION
            setCurrentDesign({
              id: nanoid(),
              frame: defaultTemplate.frame,
              metadata: {},
              name: "New Artwork",
              preview: "",
              scenes: [],
            })

            return editor.scene.importFromJSON(defaultTemplate)
          })
          .then(() => {
            const initialDesign = editor.scene.exportToJSON() as any
            editor.renderer.render(initialDesign).then((data) => {
              setCurrentScene({ ...initialDesign, preview: data, duration: 5000 })
              setScenes([{ ...initialDesign, preview: data, duration: 5000 }])
            })
          })
          .catch(console.log)
      }
    }
  }, [editor, currentScene])

  const updateCurrentScene = React.useCallback(
    async (design: IScene) => {
      await editor.scene.importFromJSON(design)
      const updatedPreview = (await editor.renderer.render(design)) as string
      setCurrentPreview(updatedPreview)
    },
    [editor, currentScene]
  )

  const addScene = React.useCallback(async () => {
    setCurrentPreview("")
    const updatedTemplate = editor.scene.exportToJSON()
    const updatedPreview = await editor.renderer.render(updatedTemplate)

    const updatedPages = scenes.map((p) => {
      if (p.id === updatedTemplate.id) {
        return { ...updatedTemplate, preview: updatedPreview, duration: p.duration }
      }
      return p
    })

    const maxTime = scenes.reduce(function (previousVal, currentValue) {
      return previousVal + currentValue.duration!
    }, 0)

    const defaultTemplate = await getDefaultTemplate(editor.canvas.canvas, currentDesign.frame)
    const newPreview = await editor.renderer.render(defaultTemplate)
    const newPage = {
      ...defaultTemplate,
      id: nanoid(),
      preview: newPreview,
      duration: 5000,
    } as any
    const newPages = [...updatedPages, newPage] as any[]
    setScenes(newPages)
    setTime(maxTime)
  }, [scenes, currentDesign])

  const changePage = React.useCallback(
    async (page: any) => {
      setCurrentPreview("")
      if (editor) {
        const updatedTemplate = editor.scene.exportToJSON()
        const updatedPreview = await editor.renderer.render(updatedTemplate)

        const updatedPages = scenes.map((p) => {
          if (p.id === updatedTemplate.id) {
            return { ...updatedTemplate, preview: updatedPreview, duration: p.duration }
          }
          return p
        }) as any[]
        setScenes(updatedPages)
        setCurrentScene(page)
      }
    },
    [editor, scenes, currentScene]
  )

  React.useEffect(() => {
    if (editor && scenes && currentScene && status !== "RUNNING") {
      const currentSceneIndex = findSceneIndexByTime(scenes, time)
      const currentIndex = scenes.findIndex((page) => page.id === currentScene.id)
      if (currentSceneIndex !== currentIndex && scenes[currentSceneIndex]) {
        changePage(scenes[currentSceneIndex])
      }
    }
  }, [editor, scenes, time, currentScene, status])

  return (
    <Block $style={{ display: "flex", alignItems: "center" }}>
      <TimelineControl />
      <Block $style={{ background: "#ffffff" }}>
        <div className={css({ display: "flex", alignItems: "center" })}>
          <Block
            id="TimelineItemsContainer"
            $style={{ display: "flex", alignItems: "center", position: "relative", padding: "1rem 0", flex: 1 }}
          >
            {contextMenuTimelineRequest.visible && <TimelineContextMenu />}
            <TimeMarker />
            <TimelineItems />
          </Block>
          <Block
            onClick={addScene}
            $style={{
              width: "100px",
              height: "56px",
              background: "rgb(243,244,246)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Add size={20} />
          </Block>
        </div>
      </Block>
    </Block>
  )
}

export default Timeline
