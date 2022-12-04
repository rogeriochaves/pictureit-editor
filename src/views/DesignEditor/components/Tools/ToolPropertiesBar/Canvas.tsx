import React, { useEffect } from "react"
import { Block } from "baseui/block"
import { useActiveObject, useEditor } from "@layerhub-io/react"

const Canvas = () => {
  const [state, setState] = React.useState({ fill: "#000000" })
  const editor = useEditor()
  const activeObject = useActiveObject() as any

  useEffect(() => {
    if (!editor) return

    setState({ fill: editor.canvas.backgroundColor as string })
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const watcher = async () => {
      setState({ fill: editor.canvas.backgroundColor as string })
    }
    editor.on("canvas:updated", watcher)
    return () => {
      editor.off("canvas:updated", watcher)
    }
  }, [editor, activeObject])

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
      >
        <Block onClick={() => {}}>
          <Block
            $style={{
              height: "24px",
              width: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backgroundColor: state.fill,
              border: "1px solid #dedede",
            }}
          />
        </Block>
      </Block>
    </Block>
  )
}

export default Canvas
