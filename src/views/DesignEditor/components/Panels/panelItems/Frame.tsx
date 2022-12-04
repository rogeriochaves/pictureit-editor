import { useEditor } from "@layerhub-io/react"
import { IEvent } from "fabric/fabric-impl"
import { useEffect } from "react"

const Frame = () => {
  const editor = useEditor()

  function mouseClickHandler(e: IEvent) {
    // eslint-disable-next-line no-console
    console.log("e", e)

    if (!e.isClick) return

    editor.frames.add({
      top: e.absolutePointer?.y, left: e.absolutePointer?.x,
      id: `frame-${editor.frames.length()}`
    })
  }

  useEffect(() => {
    let canvas = editor.canvas.canvas
    canvas.on("mouse:up", mouseClickHandler)

    return () => {
      canvas.isDrawingMode = false
      canvas.off("mouse:up", mouseClickHandler)
    }
  }, [])

  return null
}

export default Frame
