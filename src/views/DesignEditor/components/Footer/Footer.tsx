import { useRecoilValue } from "recoil"
import { editorTypeState } from "../../../../state/designEditor"
import Graphic from "./Graphic"
import Presentation from "./Presentation"
import Video from "./Video"

const Footer = () => {
  const editorType = useRecoilValue(editorTypeState)

  return {
    NONE: <></>,
    PRESENTATION: <Presentation />,
    VIDEO: <Video />,
    GRAPHIC: <Graphic />,
  }[editorType]
}

export default Footer
