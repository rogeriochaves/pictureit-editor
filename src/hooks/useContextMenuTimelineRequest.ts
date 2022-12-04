import { useRecoilValue } from "recoil"
import { contextMenuTimelineRequestState } from "../state/designEditor"

const useContextMenuTimelineRequest = () => {
  const contextMenuTimelineRequest = useRecoilValue(contextMenuTimelineRequestState)
  return contextMenuTimelineRequest
}

export default useContextMenuTimelineRequest
