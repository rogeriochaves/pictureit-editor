import { useSetRecoilState } from "recoil"
import { isSidebarOpenState } from "../state/designEditor"

const useSetIsSidebarOpen = () => {
  const setIsSidebarOpen = useSetRecoilState(isSidebarOpenState)
  return setIsSidebarOpen
}

export default useSetIsSidebarOpen
