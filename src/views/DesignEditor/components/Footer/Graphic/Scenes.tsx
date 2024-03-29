import { closestCenter, DndContext, DragOverlay, PointerSensor, useSensor } from "@dnd-kit/core"
import { restrictToFirstScrollableAncestor, restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import { arrayMove, horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import { useEditor, useFrame } from "@layerhub-io/react"
import { IScene } from "@layerhub-io/types"
import { useStyletron } from "baseui"
import { Block } from "baseui/block"
import { nanoid } from "nanoid"
import { useCallback, useEffect, useState } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { useDebouncedCallback } from "use-debounce"
import Add from "../../../../../components/Icons/Add"
import Pause from "../../../../../components/Icons/Pause"
import Play from "../../../../../components/Icons/Play"
import PlaySolid from "../../../../../components/Icons/PlaySolid"
import Scrollable from "../../../../../components/Scrollable"
import { getDefaultTemplate } from "../../../../../constants/design-editor"
import { useSaveIfNewFile } from "../../../../../hooks/useSaveLoad"
import { useSyncWithHistory } from "../../../../../hooks/useSyncWithHistory"
import {
  contextMenuTimelineRequestState,
  currentDesignState,
  currentSceneState,
  scenesState,
} from "../../../../../state/designEditor"
import { loadFileCall } from "../../../../../state/file"
import { useRecoilValueLazyLoadable } from "../../../../../utils/lazySelectorFamily"
import TimelineControl from "../Video/TimelineControl"
import TimeMarker from "../Video/TimeMarker"
import SceneContextMenu from "./SceneContextMenu"
import SceneItem from "./SceneItem"

export const useAddScene = () => {
  const editor = useEditor()
  const [scenes, setScenes] = useRecoilState(scenesState)
  const setCurrentScene = useSetCurrentScene()
  const [currentDesign] = useRecoilState(currentDesignState)

  return useCallback(
    async (switchToIt = true, imgSrcs: (string | undefined)[] = [undefined], replace = false) => {
      if (!editor) return

      const updatedTemplate = editor.scene.exportToJSON()
      const updatedPreview = await editor.renderer.render(updatedTemplate!)

      const currentSceneIndex = scenes.findIndex((s) => s.id == updatedTemplate.id)
      const updatedPages = scenes.map((s) => {
        if (s.id === updatedTemplate.id) {
          return { ...updatedTemplate, preview: updatedPreview }
        }
        return s
      })

      const startIndex = replace ? currentSceneIndex + 1 : updatedPages.length
      const newPages = [...updatedPages]

      let sceneIndex = startIndex
      for (const imgSrc of imgSrcs) {
        const defaultTemplate = await getDefaultTemplate(editor.canvas.canvas, currentDesign.frame)
        if (imgSrc) {
          //@ts-ignore
          defaultTemplate.layers[0].image = imgSrc
        }
        const newPreview = await editor.renderer.render(defaultTemplate)
        newPages[sceneIndex] = { ...defaultTemplate, id: nanoid(), preview: newPreview }
        setScenes([...newPages])
        sceneIndex++
      }

      if (switchToIt && newPages[startIndex]) {
        setCurrentScene(newPages[startIndex])
      }
    },
    [editor, scenes, currentDesign, setScenes, setCurrentScene]
  )
}

export const useSetCurrentScene = () => {
  const editor = useEditor()
  const [_, setCurrentScenePrivate] = useRecoilState(currentSceneState)

  return useCallback(
    async (nextScene: IScene) => {
      if (!editor || !nextScene) return

      await editor.history.runWithoutAffectingHistory(async () => {
        await editor.scene.importFromJSON(nextScene)
      })

      editor.history.save()
      setCurrentScenePrivate(nextScene)
    },
    [setCurrentScenePrivate, editor]
  )
}

const Scenes = () => {
  const [scenes, setScenes] = useRecoilState(scenesState)
  const [currentScene, setCurrentScenePrivate] = useRecoilState(currentSceneState)
  const setCurrentDesign = useSetRecoilState(currentDesignState)
  const editor = useEditor()
  const [css] = useStyletron()
  const frame = useFrame()
  const [draggedScene, setDraggedScene] = useState<IScene | null>(null)
  const contextMenuTimelineRequest = useRecoilValue(contextMenuTimelineRequestState)
  const saveIfNewFile = useSaveIfNewFile()
  const loadRequest = useRecoilValueLazyLoadable(loadFileCall)
  const [playbackStatus, setPlaybackStatus] = useState<"playing" | "paused">()

  useSyncWithHistory({
    currentScene: [currentScene, setCurrentScenePrivate],
    scenes: [scenes, setScenes],
  })

  const sensors = [
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  ]

  const setCurrentScene = useSetCurrentScene()

  // Scene setup, once editor loads
  useEffect(() => {
    if (!editor) return
    if (currentScene) return

    const loadedFile = loadRequest.contents?.content

    if (loadedFile) {
      setCurrentDesign(loadedFile)
      setScenes(loadedFile.scenes)
      setCurrentScene(loadedFile.scenes[0])
    } else {
      getDefaultTemplate(editor.canvas.canvas, { width: 512, height: 512 }).then(async (defaultTemplate) => {
        setCurrentDesign({
          id: nanoid(),
          frame: defaultTemplate.frame,
          metadata: {},
          name: "New Artwork",
          preview: "",
          scenes: [],
        })

        const data = await editor.renderer.render(defaultTemplate)

        setScenes([{ ...defaultTemplate, preview: data }])
        await setCurrentScene({ ...defaultTemplate, preview: data })

        // Save new file when scene is first set
        saveIfNewFile()
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!editor])

  const rerenderPreview = useDebouncedCallback(async () => {
    if (!editor) return

    const updatedTemplate = editor.scene.exportToJSON()
    const updatedPreview = await editor.renderer.render(updatedTemplate)
    setScenes(
      scenes.map((scene) => {
        if (scene.id == currentScene?.id) {
          return { ...scene, preview: updatedPreview }
        }
        return scene
      })
    )
  }, 100)

  useEffect(() => {
    if (!editor) return

    editor.on("history:saved", rerenderPreview)
    return () => {
      editor.off("history:saved", rerenderPreview)
    }
  }, [editor, rerenderPreview])

  const addScene = useAddScene()

  const changePage = useCallback(
    async (page: any) => {
      if (!editor) return
      if (currentScene?.id == page.id) return

      const updatedTemplate = editor.scene.exportToJSON()

      const updatedPages = scenes.map((p) => {
        if (p.id === updatedTemplate.id) {
          return { ...updatedTemplate, preview: p.preview }
        }
        return p
      })

      setScenes(updatedPages)
      setCurrentScene(page)
    },
    [editor, currentScene, scenes, setScenes, setCurrentScene]
  )

  const handleDragStart = (event: any) => {
    const draggedScene = scenes.find((s) => s.id === event.active.id)
    if (draggedScene) {
      setDraggedScene(draggedScene)
    }
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setScenes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
    setDraggedScene(null)
  }

  return (
    <DndContext
      modifiers={[restrictToFirstScrollableAncestor, restrictToHorizontalAxis]}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <Block
        id="TimelineItemsContainer"
        $style={{ padding: "0.25rem 0.75rem 0 0.75rem", background: "#ffffff", position: "relative" }}
      >
        <div className={css({ display: "flex", alignItems: "center" })}>
          {contextMenuTimelineRequest.visible && <SceneContextMenu />}

          <TimelineControl />

          <Scrollable style={{height: "116px"}}>
            <Block display="flex">
              <TimeMarker />
              <SortableContext items={scenes} strategy={horizontalListSortingStrategy}>
                {scenes.map((page, index) => (
                  <SceneItem
                    key={index}
                    isCurrentScene={page.id === currentScene?.id}
                    scene={page}
                    index={index}
                    changePage={changePage}
                    preview={page.preview || ""}
                  />
                ))}
                <div
                  style={{
                    background: "#ffffff",
                    padding: "1rem 1rem 1rem 0.5rem",
                  }}
                >
                  <div
                    onClick={() => addScene()}
                    className={css({
                      width: "100px",
                      height: "56px",
                      background: "rgb(243,244,246)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    })}
                  >
                    <Add size={20} />
                  </div>
                </div>
              </SortableContext>
            </Block>
          </Scrollable>
          <DragOverlay>
            {draggedScene ? (
              <Block
                $style={{
                  backgroundImage: `url(${draggedScene.preview})`,
                  backgroundSize: `${frame ? (frame.width * 70) / frame.height : 70}px 70px`,
                  height: "80px",
                  opacity: 0.75,
                }}
              />
            ) : null}
          </DragOverlay>
        </div>
      </Block>
    </DndContext>
  )
}

export default Scenes
