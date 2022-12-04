import { useEditor } from "@layerhub-io/react"
import { Block } from "baseui/block"
import { Button, KIND, SIZE } from "baseui/button"
import { PLACEMENT, StatefulPopover } from "baseui/popover"
import { StatefulTooltip } from "baseui/tooltip"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { nanoid } from "nanoid"
import { useCallback, useEffect } from "react"
import { HexColorPicker } from "react-colorful"
import { useRecoilState } from "recoil"
import { drawingColorState } from "../../../../state/designEditor"
import { ColorSquare } from "./Shared/ColorSquare"
import { Separator } from "./Shared/Separator"

const DrawingTool = () => {
  const [drawingColor, setDrawingColor] = useRecoilState(drawingColorState)
  const editor = useEditor()

  const objectAddedHandler = useCallback(
    (e: IEvent) => {
      const object = e.target!
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
    canvas.freeDrawingBrush.color = drawingColor
    canvas.on("object:added", objectAddedHandler)

    return () => {
      canvas.isDrawingMode = false
      canvas.off("object:added", objectAddedHandler)
    }
  }, [drawingColor, editor, objectAddedHandler])

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
        <Block>Free Drawing</Block>
        <Separator />

        <StatefulPopover
          showArrow={true}
          placement={PLACEMENT.bottom}
          content={() => (
            <Block padding="12px" width="200px" backgroundColor="#ffffff" display="grid" gridGap="8px">
              <HexColorPicker
                color={drawingColor}
                onChange={(color) => {
                  setDrawingColor(color)
                  editor.canvas.canvas.freeDrawingBrush.color = color
                }}
                style={{ width: "100%" }}
              />
            </Block>
          )}
        >
          <Block>
            <StatefulTooltip placement={PLACEMENT.bottom} showArrow={true} accessibilityType="tooltip" content="Color">
              <Button size={SIZE.mini} kind={KIND.tertiary}>
                <ColorSquare color={drawingColor} />
              </Button>
            </StatefulTooltip>
          </Block>
        </StatefulPopover>
      </Block>
    </Block>
  )
}

export default DrawingTool
