import {
  activeToolState,
  isMobileState,
} from "../state/appContext"
import { useRecoilState } from "recoil"

const useAppContext = () => {
  const [isMobile, setIsMobile] = useRecoilState(isMobileState)
  const [activeTool, setActiveTool] = useRecoilState(activeToolState)

  return {
    isMobile,
    setIsMobile,
    activeTool,
    setActiveTool,
  }
}

export default useAppContext
