import { useEditor } from "@layerhub-io/react"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { useEffect } from "react"

const square = new fabric.Rect({
  width: 1024,
  height: 1024,
  left: 0,
  top: 0,
  fill: "rgba(24, 142, 226, 0.3)",
  visible: false,
  selectable: false,
  hasControls: false,
  hasBorders: true,
  stroke: "rgba(24, 142, 226, 1)",
  strokeWidth: 3,
})

const Generation = () => {
  const editor = useEditor()

  function mouseMoveHandler(e: IEvent) {
    square.left = (e.absolutePointer?.x || 0) - ((square.width || 0) / 2)
    square.top = (e.absolutePointer?.y || 0)  - ((square.height || 0) / 2)
    square.visible = true
    editor.canvas.canvas.requestRenderAll()
  }

  function mouseOutHandler(e: IEvent) {
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

    // fabric.util.loadImage(url, function(img) {
    //   text.set('fill', new fabric.Pattern({
    //     source: img,
    //     repeat: document.getElementById('repeat').value
    //   }));
    //   shape.set('fill', new fabric.Pattern({
    //     source: img,
    //     repeat: document.getElementById('repeat').value
    //   }));
    //   canvas.renderAll();
    // });


    canvas.on("mouse:move", mouseMoveHandler)
    canvas.on("mouse:out", mouseOutHandler)

    return () => {
      canvas.remove(square)
      canvas.off("mouse:move", mouseMoveHandler)
      canvas.off("mouse:out", mouseOutHandler)
    }
  }, [])

  return null
}

export default Generation
