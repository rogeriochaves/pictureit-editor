import { useRecoilValue } from "recoil"
import { contextMenuSceneRequestState } from "../state/designEditor"

const useContextMenuSceneRequest = () => {
  const contextMenuSceneRequest = useRecoilValue(contextMenuSceneRequestState)
  return contextMenuSceneRequest
}

export default useContextMenuSceneRequest
