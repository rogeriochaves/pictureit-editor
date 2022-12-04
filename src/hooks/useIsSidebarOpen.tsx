import { useRecoilValue } from "recoil"
import { isSidebarOpenState } from "../contexts/DesignEditor"

const useIsSidebarOpen = () => {
  const isSidebarOpen = useRecoilValue(isSidebarOpenState)
  return isSidebarOpen
}

export default useIsSidebarOpen
