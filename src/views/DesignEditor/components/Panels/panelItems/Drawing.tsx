import { useEditor } from "@layerhub-io/react"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { nanoid } from "nanoid"
import { useCallback, useEffect } from "react"
import useSetIsSidebarOpen from "~/hooks/useSetIsSidebarOpen"

const Drawing = () => {
  const editor = useEditor()
  const setIsSidebarOpen = useSetIsSidebarOpen()

  useEffect(() => {
    setIsSidebarOpen(false)
    editor.objects.deselect()
  }, [editor, setIsSidebarOpen])

  return null
}

export default Drawing
