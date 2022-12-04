import React, { useCallback, useEffect, useState } from "react"
import { Block } from "baseui/block"
import Common from "./Common"
import Flip from "./Shared/Flip"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import { Separator } from "./Shared/Separator"
import { PLACEMENT, StatefulPopover } from "baseui/popover"
import { HexColorPicker } from "react-colorful"
import { StatefulTooltip } from "baseui/tooltip"
import { Button, KIND, SIZE } from "baseui/button"
import { ColorSquare } from "./Shared/ColorSquare"

const Path = () => {
  const [state, setState] = React.useState({ stroke: "transparent" })
  const editor = useEditor()!
  const activeObject = useActiveObject<fabric.Object>()

  React.useEffect(() => {
    if (activeObject && activeObject.type === "StaticPath") {
      setState({ stroke: activeObject.stroke ?? "transparent" })
    }
  }, [activeObject])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangeColor = useCallback(
    (color: string) => {
      activeObject.stroke = color
      editor.canvas.canvas.requestRenderAll()
    },
    [activeObject, editor]
  )

  React.useEffect(() => {
    const watcher = async () => {
      if (activeObject && activeObject.type === "StaticPath") {
        setState({ stroke: activeObject.stroke ?? "transparent" })
      }
    }
    if (editor) {
      editor.on("history:changed", watcher)
    }
    return () => {
      if (editor) {
        editor.off("history:changed", watcher)
      }
    }
  }, [editor, activeObject])

  function ColorPicker<T>(props: T & { onChange: (color: string) => void }) {
    const [changedColor, setChangedColor] = useState(false)

    useEffect(() => {
      return () => {
        if (changedColor) {
          editor.history.save()
        }
      }
    }, [changedColor])

    return (
      <HexColorPicker
        {...props}
        onChange={(color) => {
          setChangedColor(true)
          props.onChange(color)
        }}
      />
    )
  }

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
        <Block>{activeObject?.name}</Block>
        <Separator />
        <StatefulPopover
          showArrow={true}
          placement={PLACEMENT.bottom}
          content={() => (
            <Block padding="12px" width="200px" backgroundColor="#ffffff" display="grid" gridGap="8px">
              <ColorPicker color={state.stroke} onChange={onChangeColor} style={{ width: "100%" }} />
            </Block>
          )}
        >
          <Block>
            <StatefulTooltip placement={PLACEMENT.bottom} showArrow={true} accessibilityType="tooltip" content="Color">
              <Button size={SIZE.mini} kind={KIND.tertiary}>
                <ColorSquare color={state.stroke} />
              </Button>
            </StatefulTooltip>
          </Block>
        </StatefulPopover>
        <Flip />
      </Block>
      <Common />
    </Block>
  )
}

export default Path
