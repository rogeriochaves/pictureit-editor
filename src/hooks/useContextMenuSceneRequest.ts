import { useRecoilValue } from "recoil"
import { contextMenuSceneRequestState } from "../contexts/DesignEditor"

const useContextMenuSceneRequest = () => {
  const contextMenuSceneRequest = useRecoilValue(contextMenuSceneRequestState)
  return contextMenuSceneRequest
}

export default useContextMenuSceneRequest
