import { transparentPattern } from "@layerhub-io/core"
import { useEditor } from "@layerhub-io/react"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { useEffect } from "react"

const square = new fabric.Rect({
  width: 512,
  height: 512,
  left: 0,
  top: 0,
  fill: transparentPattern,
  opacity: 0.8,
  visible: false,
  selectable: false,
  hasControls: false,
  hasBorders: true,
  stroke: "rgba(24, 142, 226, 1)",
  strokeWidth: 3,
})

let requestDragging = false
const Generation = () => {
  const editor = useEditor()

  function mouseMoveHandler(e: IEvent) {
    if (requestDragging) {
      square.left = (e.absolutePointer?.x || 0) - (square.width || 0) / 2
      square.top = (e.absolutePointer?.y || 0) - (square.height || 0) / 2
      requestDragging = false
      editor.canvas.canvas.requestRenderAll()
      //@ts-ignore
      editor.canvas.canvas._setupCurrentTransform(e.e, square)
    }
  }

  function mouseOverHandler(e: IEvent) {
    square.visible = true
    editor.canvas.canvas.requestRenderAll()

    setTimeout(() => {
      requestDragging = true
    }, 10)
  }

  function mouseOutHandler(e: IEvent) {
    //@ts-ignore
    editor.canvas.canvas._currentTransform = null
    square.visible = false
    editor.canvas.canvas.requestRenderAll()
  }

  useEffect(() => {
    let canvas = editor.canvas.canvas
    canvas.add(square)
    // canvas.sendToBack(square)
    // canvas.sendToBack(editor.frame.frame)
    // canvas.sendToBack(editor.frame.background)
    // // hack: in front of the background
    // canvas.bringForward(square)
    // // hack: in front of the frame
    // canvas.bringForward(square)

    canvas.on("mouse:over", mouseOverHandler)
    canvas.on("mouse:out", mouseOutHandler)
    canvas.on("mouse:move", mouseMoveHandler)

    return () => {
      canvas.remove(square)
      canvas.off("mouse:over", mouseOverHandler)
      canvas.off("mouse:out", mouseOutHandler)
      canvas.on("mouse:move", mouseMoveHandler)
    }
  }, [])

  return null
}

export default Generation
