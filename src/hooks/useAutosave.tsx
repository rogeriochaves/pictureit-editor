import { nanoid } from "nanoid"
import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { sampleImage } from "../api/adapters/mocked"
import { saveFileRequest } from "../state/file"
import { useRecoilLazyLoadable } from "../utils/lazySelectorFamily"

const useAutosave = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [_saveRequest, saveFile] = useRecoilLazyLoadable(saveFileRequest)

  useEffect(() => {
    if (!id) {
      const newId = nanoid()
      saveFile({
        id: newId,
        name: "test file name",
        preview: sampleImage,
        content: "{}",
      }).then((saved) => {
        if (saved) {
          navigate(`/editor/${newId}`, { replace: true })
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return []
}

export default useAutosave
