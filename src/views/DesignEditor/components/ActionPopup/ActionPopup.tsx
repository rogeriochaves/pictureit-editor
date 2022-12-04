import { LayerType } from "@layerhub-io/core"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import { Button, KIND } from "baseui/button"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { useCallback, useEffect, useRef, useState } from "react"

const ActionPopup = () => {
  const editor = useEditor()
  const popupRef = useRef<HTMLDivElement>(null)
  const activeObject = useActiveObject() as fabric.Object | undefined
  const [popup, setPopup] = useState<{ x: number; y: number; target: fabric.Object; isMoving: boolean } | null>(null)

  const setPopupForTarget = (target: fabric.Object | undefined) => {
    if (target && target.type == LayerType.GENERATION_FRAME && target.oCoords) {
      const { x, y } = target.oCoords.mt // mid-top
      setPopup({ x, y, target, isMoving: false })
    } else {
      setPopup(null)
    }
  }

  useEffect(() => {
    if (!editor) return

    setPopupForTarget(activeObject)
  }, [editor, activeObject])

  const onModified = useCallback(
    (e: IEvent) => {
      if (e.target && popup && popup.target.id == e.target.id) {
        setPopupForTarget(activeObject)
      }
    },
    [popup]
  )

  const onMove = useCallback(() => {
    if (popup && !popup.isMoving) {
      setPopup({ ...popup, isMoving: true })
    }
  }, [popup])

  useEffect(() => {
    if (!editor) return

    editor.canvas.canvas.on("object:modified", onModified)
    editor.canvas.canvas.on("object:moving", onMove)
    return () => {
      editor.canvas.canvas.off("object:modified", onModified)
      editor.canvas.canvas.off("object:moving", onMove)
    }
  }, [editor, onModified, onMove])


  const Pill = ({ value }: { value: string }) => {
    return (
      <div
        style={{
          borderRadius: "100px",
          background: "#ccc",
          padding: "5px 12px 5px 12px",
          fontSize: "13px",
        }}
      >
        {value}
      </div>
    )
  }

  const popupWidth = 500
  const minX = (popupRef.current?.getBoundingClientRect().x || 0) * -1 + 12
  const minY = (popupRef.current?.getBoundingClientRect().y || 0) * -1 + 12

  return (
    <div ref={popupRef}>
      {popup && !popup.isMoving ? (
        <div
          style={{
            position: "absolute",
            zIndex: 128,
            top: `${Math.max(popup.y - 120, minY)}px`,
            left: `${Math.max(popup.x - popupWidth / 2, minX)}px`,
            background: "#eeeaee",
            border: "1px solid #c4c4c4",
            padding: "12px",
            borderRadius: "10px",
            width: `${popupWidth}px`,
            boxShadow: "0px 0px 10px rgba(0,0,0,.2)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              style={{
                borderRadius: "5px",
                background: "#FFF",
                padding: "5px",
                flexGrow: "1",
                border: "1px solid #c4c4c4",
              }}
            />
            <Button size="compact">Generate</Button>
            {/* <Button size="compact" kind={KIND.secondary} colors={{color: "#FFF", backgroundColor: "#999"}}>
          1
        </Button> */}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Pill value="trending on artstation" />
            <Pill value="sharp focus" />
            <Pill value="highly detailed" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ActionPopup