import SelectEditor from "./SelectEditor"
import GraphicEditor from "./GraphicEditor"
import PresentationEditor from "./PresentationEditor"
import VideoEditor from "./VideoEditor"
import Preview from "./components/Preview"
import { useRecoilState, useRecoilValue } from "recoil"
import { displayPreviewState, editorTypeState } from "../../state/designEditor"

const DesignEditor = () => {
  const editorType = useRecoilValue(editorTypeState)
  const [ displayPreview, setDisplayPreview ] = useRecoilState(displayPreviewState)

  return (
    <>
      {displayPreview && <Preview isOpen={displayPreview} setIsOpen={setDisplayPreview} />}
      {
        {
          NONE: <SelectEditor />,
          PRESENTATION: <PresentationEditor />,
          VIDEO: <VideoEditor />,
          GRAPHIC: <GraphicEditor />,
        }[editorType]
      }
    </>
  )
}

export default DesignEditor
