import { useRecoilValue } from "recoil"
import { contextMenuTimelineRequestState } from "../contexts/DesignEditor"

const useContextMenuTimelineRequest = () => {
  const contextMenuTimelineRequest = useRecoilValue(contextMenuTimelineRequestState)
  return contextMenuTimelineRequest
}

export default useContextMenuTimelineRequest
