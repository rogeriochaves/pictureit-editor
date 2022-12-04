import {
  activePanelState,
  activeSubMenuState,
  currentTemplateState,
  isMobileState,
  shapesState,
  templatesState,
  uploadsState,
} from "../contexts/AppContext"
import { useRecoilState } from "recoil"

const useAppContext = () => {
  const [isMobile, setIsMobile] = useRecoilState(isMobileState)
  const [templates, setTemplates] = useRecoilState(templatesState)
  const [uploads, setUploads] = useRecoilState(uploadsState)
  const [shapes, setShapes] = useRecoilState(shapesState)
  const [activePanel, setActivePanel] = useRecoilState(activePanelState)
  const [activeSubMenu, setActiveSubMenu] = useRecoilState(activeSubMenuState)
  const [currentTemplate, setCurrentTemplate] = useRecoilState(currentTemplateState)

  return {
    isMobile,
    setIsMobile,
    templates,
    setTemplates,
    uploads,
    setUploads,
    shapes,
    setShapes,
    activePanel,
    setActivePanel,
    activeSubMenu,
    setActiveSubMenu,
    currentTemplate,
    setCurrentTemplate,
  }
}

export default useAppContext
