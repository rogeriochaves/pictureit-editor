import { useRecoilValue } from "recoil"
import { scenesState } from "../contexts/DesignEditor"

const useDesignEditorScenes = () => {
  const scenes = useRecoilValue(scenesState)
  return scenes
}

export default useDesignEditorScenes
