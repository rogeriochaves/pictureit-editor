import { useRecoilState } from "recoil"
import {
  contextMenuTimelineRequestState,
  currentDesignState,
  currentSceneState,
  displayPlaybackState,
  displayPreviewState,
  editorTypeState,
  maxTimeState,
  scenesState,
} from "../state/designEditor"

const useDesignEditorContext = () => {
  const [editorType, setEditorType] = useRecoilState(editorTypeState)
  const [displayPlayback, setDisplayPlayback] = useRecoilState(displayPlaybackState)
  const [currentScene, setCurrentScene] = useRecoilState(currentSceneState)
  const [scenes, setScenes] = useRecoilState(scenesState)
  const [maxTime, setMaxTime] = useRecoilState(maxTimeState)
  const [contextMenuTimelineRequest, setContextMenuTimelineRequest] = useRecoilState(contextMenuTimelineRequestState)
  const [currentDesign, setCurrentDesign] = useRecoilState(currentDesignState)

  return {
    editorType,
    setEditorType,
    displayPlayback,
    setDisplayPlayback,
    currentScene,
    setCurrentScene,
    scenes,
    setScenes,
    maxTime,
    setMaxTime,
    contextMenuTimelineRequest,
    setContextMenuTimelineRequest,
    currentDesign,
    setCurrentDesign,
  }
}

export default useDesignEditorContext
