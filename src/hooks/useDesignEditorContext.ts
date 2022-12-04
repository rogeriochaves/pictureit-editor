import { useRecoilState } from "recoil"
import {
  contextMenuSceneRequestState,
  contextMenuTimelineRequestState,
  currentDesignState,
  currentSceneState,
  displayPlaybackState,
  displayPreviewState,
  editorTypeState,
  maxTimeState,
  scenesState,
} from "../contexts/DesignEditor"

const useDesignEditorContext = () => {
  const [editorType, setEditorType] = useRecoilState(editorTypeState)
  const [displayPlayback, setDisplayPlayback] = useRecoilState(displayPlaybackState)
  const [displayPreview, setDisplayPreview] = useRecoilState(displayPreviewState)
  const [currentScene, setCurrentScene] = useRecoilState(currentSceneState)
  const [scenes, setScenes] = useRecoilState(scenesState)
  const [maxTime, setMaxTime] = useRecoilState(maxTimeState)
  const [contextMenuTimelineRequest, setContextMenuTimelineRequest] = useRecoilState(contextMenuTimelineRequestState)
  const [contextMenuSceneRequest, setContextMenuSceneRequest] = useRecoilState(contextMenuSceneRequestState)
  const [currentDesign, setCurrentDesign] = useRecoilState(currentDesignState)

  return {
    editorType,
    setEditorType,
    displayPlayback,
    setDisplayPlayback,
    setDisplayPreview,
    displayPreview,
    currentScene,
    setCurrentScene,
    setScenes,
    scenes,
    maxTime,
    setMaxTime,
    contextMenuTimelineRequest,
    setContextMenuTimelineRequest,
    contextMenuSceneRequest,
    setContextMenuSceneRequest,
    currentDesign,
    setCurrentDesign,
  }
}

export default useDesignEditorContext
