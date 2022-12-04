import { useRecoilValue } from "recoil"
import { isSidebarOpenState } from "../state/designEditor"

const useIsSidebarOpen = () => {
  const isSidebarOpen = useRecoilValue(isSidebarOpenState)
  return isSidebarOpen
}

export default useIsSidebarOpen
