import { useEditor } from "@layerhub-io/react"
import { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { isSidebarOpenState } from "../../../../../state/designEditor"

const Drawing = () => {
  const editor = useEditor()
  const setIsSidebarOpen = useSetRecoilState(isSidebarOpenState)

  useEffect(() => {
    setIsSidebarOpen(false)
    editor.objects.deselect()
  }, [editor, setIsSidebarOpen])

  return null
}

export default Drawing
