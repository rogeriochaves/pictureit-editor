import { useEffect } from "react"
import { Canvas as LayerhubCanvas, useEditor } from "@layerhub-io/react"
import Playback from "../Playback"
import useDesignEditorContext from "~/hooks/useDesignEditorContext"
import ContextMenu from "../ContextMenu"
import ActionPopup from "../ActionPopup"

const Canvas = () => {
  const editor = useEditor()
  const { displayPlayback } = useDesignEditorContext()

  useEffect(() => {
    if (!editor) return

    if (process.env.NODE_ENV !== "production") {
      //@ts-ignore
      window.canvas = editor.canvas.canvas
    }
  }, [editor])

  return (
    <div style={{ flex: 1, display: "flex", position: "relative" }}>
      {displayPlayback && <Playback />}
      <ContextMenu />
      <ActionPopup />
      <LayerhubCanvas
        config={{
          background: "#f1f2f6",
          controlsPosition: {
            rotation: "BOTTOM",
          },
          shadow: {
            blur: 4,
            color: "#fcfcfc",
            offsetX: 0,
            offsetY: 0,
          },
        }}
      />
    </div>
  )
}

export default Canvas
