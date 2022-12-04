import { useRecoilValue } from "recoil"
import { editorTypeState } from "../state/designEditor"

const useEditorType = () => {
  const editorType = useRecoilValue(editorTypeState)
  return editorType
}

export default useEditorType
