import { useRecoilValue } from "recoil"
import { scenesState } from "../state/designEditor"

const useDesignEditorScenes = () => {
  const scenes = useRecoilValue(scenesState)
  return scenes
}

export default useDesignEditorScenes
