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
  }, [setIsSidebarOpen])

  const objectAddedHandler = useCallback(
    (e: IEvent) => {
      const object = e.target!
      // @ts-ignore
      object.id = nanoid()
      object.name = "Free Drawing"
      object.type = "StaticPath"
      editor.objects.afterAddHook(object, false)
    },
    [editor]
  )

  useEffect(() => {
    const canvas = editor.canvas.canvas
    canvas.isDrawingMode = true
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
    canvas.freeDrawingBrush.width = 15
    canvas.freeDrawingBrush.color = "rgb(255, 0, 0)"
    canvas.on("object:added", objectAddedHandler)

    return () => {
      canvas.isDrawingMode = false
      canvas.off("object:added", objectAddedHandler)
    }
  }, [editor, objectAddedHandler])

  return null
}

export default Drawing
