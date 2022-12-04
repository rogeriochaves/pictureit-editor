import { LayerType, transparentPattern } from "@layerhub-io/core"
import { useEditor } from "@layerhub-io/react"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { useEffect } from "react"
import { PanelType } from "../../../../../constants/app-options"
import useAppContext from "../../../../../hooks/useAppContext"

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
  type: LayerType.POSITIONING_HELPER,
})

let requestDragging = false
const Generation = () => {
  const editor = useEditor()
  const { setActivePanel } = useAppContext()

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

  function mouseOverHandler(_e: IEvent) {
    square.visible = true
    editor.canvas.canvas.requestRenderAll()

    setTimeout(() => {
      requestDragging = true
    }, 10)
  }

  function mouseOutHandler(_e: IEvent) {
    //@ts-ignore
    editor.canvas.canvas._currentTransform = null
    square.visible = false
    editor.canvas.canvas.requestRenderAll()
  }

  function mouseUpHandler(_e: IEvent) {
    const generationFrame = new fabric.Rect({
      width: 512,
      height: 512,
      left: square.left,
      top: square.top,
      fill: transparentPattern,
      selectable: true,
      hasControls: false,
      hasBorders: true,
      type: LayerType.GENERATION_FRAME,
    })
    editor.canvas.canvas.add(generationFrame)
    editor.canvas.canvas.setActiveObject(generationFrame)
    setActivePanel(PanelType.MOVE)
  }

  useEffect(() => {
    let canvas = editor.canvas.canvas
    canvas.add(square)

    canvas.on("mouse:over", mouseOverHandler)
    canvas.on("mouse:out", mouseOutHandler)
    canvas.on("mouse:move", mouseMoveHandler)
    canvas.on("mouse:up", mouseUpHandler)

    return () => {
      square.visible = false
      canvas.remove(square)
      canvas.off("mouse:over", mouseOverHandler)
      canvas.off("mouse:out", mouseOutHandler)
      canvas.off("mouse:move", mouseMoveHandler)
      canvas.off("mouse:up", mouseUpHandler)
    }
  }, [])

  return null
}

export default Generation
