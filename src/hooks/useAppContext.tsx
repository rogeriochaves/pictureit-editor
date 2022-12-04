import {
  activeToolState,
  activeSubMenuState,
  isMobileState,
} from "../state/appContext"
import { useRecoilState } from "recoil"

const useAppContext = () => {
  const [isMobile, setIsMobile] = useRecoilState(isMobileState)
  const [activeTool, setActiveTool] = useRecoilState(activeToolState)
  const [activeSubMenu, setActiveSubMenu] = useRecoilState(activeSubMenuState)

  return {
    isMobile,
    setIsMobile,
    activeTool,
    setActiveTool,
    activeSubMenu,
    setActiveSubMenu,
  }
}

export default useAppContext
