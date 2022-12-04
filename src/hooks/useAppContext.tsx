import {
  activePanelState,
  activeSubMenuState,
  isMobileState,
} from "../state/appContext"
import { useRecoilState } from "recoil"

const useAppContext = () => {
  const [isMobile, setIsMobile] = useRecoilState(isMobileState)
  const [activePanel, setActivePanel] = useRecoilState(activePanelState)
  const [activeSubMenu, setActiveSubMenu] = useRecoilState(activeSubMenuState)

  return {
    isMobile,
    setIsMobile,
    activePanel,
    setActivePanel,
    activeSubMenu,
    setActiveSubMenu,
  }
}

export default useAppContext
