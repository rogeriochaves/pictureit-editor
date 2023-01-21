import { useEditor } from "@layerhub-io/react"
import { Block } from "baseui/block"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { useEffect } from "react"
import { useRecoilState } from "recoil"
import Eraser from "../../../../../components/Icons/Eraser"
import { eraserBrushSizeState } from "../../../../../state/designEditor"
import { BrushSize } from "./Shared/BrushSize"
import { Separator } from "./Shared/Separator"

const EraserTool = () => {
  const [brushSize, setBrushSize] = useRecoilState(eraserBrushSizeState)
  const editor = useEditor()!

  const erasingEndHandler = (e: IEvent) => {
    if (!e.subTargets) return

    for (const target of e.subTargets) {
      if (target.group instanceof fabric.GenerationFrame) {
        const frame = target.group

        if (frame.metadata?.initImage) {
          frame.metadata = {
            ...frame.metadata,
            initImage: {
              ...frame.metadata.initImage,
              fixed: false,
            },
          }
          delete frame.metadata.modelKey
        }
      }
    }
  }

  useEffect(() => {
    const canvas = editor.canvas.canvas

    //@ts-ignore
    const eraser = new fabric.EraserBrush(canvas)
    eraser.canvas = canvas
    eraser.width = brushSize

    canvas.freeDrawingBrush = eraser
    canvas.isDrawingMode = true
    canvas.on("erasing:end", erasingEndHandler)

    return () => {
      canvas.isDrawingMode = false
      canvas.off("erasing:end", erasingEndHandler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const canvas = editor.canvas.canvas
    canvas.freeDrawingBrush.width = brushSize
  }, [brushSize, editor.canvas.canvas])

  return (
    <Block
      $style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        justifyContent: "space-between",
      }}
    >
      <Block
        $style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
        }}
        gridGap="0.5rem"
      >
        <Block>Inpainting</Block>
        <Separator />

        <BrushSize title="Eraser size" brushSize={brushSize} setBrushSize={setBrushSize} icon={Eraser} />
      </Block>
    </Block>
  )
}

export default EraserTool
