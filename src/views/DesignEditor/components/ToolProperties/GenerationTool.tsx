import { LayerType, transparentPattern } from "@layerhub-io/core"
import { useEditor } from "@layerhub-io/react"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { activeToolState, ToolType } from "../../../../state/designEditor"
import Canvas from "./Canvas"

const square = new fabric.Rect({
  width: 512,
  height: 512,
  left: 0,
  top: 0,
  opacity: 0.8,
  visible: false,
  selectable: true,
  hasControls: false,
  hasBorders: true,
  type: LayerType.POSITIONING_HELPER,
})

let requestDragging = false
const GenerationTool = () => {
  const editor = useEditor()
  const setActiveTool = useSetRecoilState(activeToolState)

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
    editor.canvas.canvas.setActiveObject(square)
    editor.canvas.canvas.requestRenderAll()

    setTimeout(() => {
      requestDragging = true
    }, 10)
  }

  function mouseOutHandler(_e: IEvent) {
    //@ts-ignore
    editor.canvas.canvas._currentTransform = null
    square.visible = false
    editor.canvas.canvas.discardActiveObject()
    editor.canvas.canvas.requestRenderAll()
  }

  async function mouseUpHandler(_e: IEvent) {
    const options = {
      type: LayerType.GENERATION_FRAME,
      width: 512,
      height: 512,
      left: (square.left || 0) - editor.frame.options.left,
      top: (square.top || 0) - editor.frame.options.top + 1,
      fill: transparentPattern,
      name: "Generation Frame",
    }
    const generationFrame = await editor.objects.add(options)
    editor.objects.sendToBack(generationFrame.id)

    setTimeout(() => {
      const prompt = document.getElementById("actionPopupPrompt")
      if (prompt) {
        prompt.focus()
      }
    }, 50)
    setActiveTool(ToolType.MOVE)
  }

  useEffect(() => {
    const canvas = editor.canvas.canvas
    canvas.add(square)

    canvas.on("mouse:over", mouseOverHandler)
    canvas.on("mouse:out", mouseOutHandler)
    canvas.on("mouse:move", mouseMoveHandler)
    canvas.on("mouse:up", mouseUpHandler)

    square.fill = transparentPattern

    return () => {
      square.visible = false
      canvas.remove(square)
      canvas.off("mouse:over", mouseOverHandler)
      canvas.off("mouse:out", mouseOutHandler)
      canvas.off("mouse:move", mouseMoveHandler)
      canvas.off("mouse:up", mouseUpHandler)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Canvas />
}

export default GenerationTool
