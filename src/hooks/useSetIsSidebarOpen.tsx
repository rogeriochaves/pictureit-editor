import { useSetRecoilState } from "recoil"
import { isSidebarOpenState } from "../contexts/DesignEditor"

const useSetIsSidebarOpen = () => {
  const setIsSidebarOpen = useSetRecoilState(isSidebarOpenState)
  return setIsSidebarOpen
}

export default useSetIsSidebarOpen
