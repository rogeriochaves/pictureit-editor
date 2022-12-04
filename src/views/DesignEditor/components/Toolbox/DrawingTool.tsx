import { useCallback, useEffect } from "react"
import { Block } from "baseui/block"
import { useEditor } from "@layerhub-io/react"
import { Separator } from "./Shared/Separator"
import { IEvent } from "fabric/fabric-impl"
import { fabric } from "fabric"
import { nanoid } from "nanoid"
import { Button, KIND, SIZE } from "baseui/button"
import { StatefulTooltip } from "baseui/tooltip"
import { PLACEMENT, StatefulPopover } from "baseui/popover"
import { ColorSquare } from "./Shared/ColorSquare"
import { HexColorPicker } from "react-colorful"
import { useSelector } from "react-redux"
import { RootState } from "../../../../store/rootReducer"
import { useAppDispatch } from "../../../../store/store"
import { setDrawingColor } from "../../../../store/design-editor"

const DrawingTool = () => {
  const color = useSelector((state: RootState) => state.designEditor.drawingColor)
  const dispatch = useAppDispatch()
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
    canvas.freeDrawingBrush.color = color
    canvas.on("object:added", objectAddedHandler)

    return () => {
      canvas.isDrawingMode = false
      canvas.off("object:added", objectAddedHandler)
    }
  }, [color, editor, objectAddedHandler])

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
                color={color}
                onChange={(color) => {
                  dispatch(setDrawingColor(color))
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
                <ColorSquare color={color} />
              </Button>
            </StatefulTooltip>
          </Block>
        </StatefulPopover>
      </Block>
    </Block>
  )
}

export default DrawingTool
