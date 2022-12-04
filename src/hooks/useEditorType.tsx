import { useRecoilValue } from "recoil"
import { editorTypeState } from "../contexts/DesignEditor"

const useEditorType = () => {
  const editorType = useRecoilValue(editorTypeState)
  return editorType
}

export default useEditorType
