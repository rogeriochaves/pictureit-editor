import { LayerType } from "@layerhub-io/core"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import { Button } from "baseui/button"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react"
import { useRecoilState } from "recoil"
import { generateImageRequest, hidePopupState } from "../../../../state/generateImage"
import { useRecoilLazyLoadable } from "../../../../utils/lazySelectorFamily"

const ActionPopup = () => {
  const editor = useEditor()
  const popupRef = useRef<HTMLDivElement>(null)
  const activeObject = useActiveObject() as fabric.Object | undefined
  const [popup, setPopup] = useState<{
    x: number
    y: number
    target: fabric.GenerationFrame
  } | null>(null)
  const [_, setPrompt] = useState("")
  const [hidePopup, setHidePopup] = useRecoilState(hidePopupState)
  const [imageRequest, generateImage] = useRecoilLazyLoadable(generateImageRequest(popup?.target.id))

  const setPopupForTarget = useCallback(
    (target: fabric.Object | undefined) => {
      if (target && target.type == LayerType.GENERATION_FRAME && target.oCoords) {
        const { x, y } = target.oCoords.mt // mid-top
        setPrompt(target.metadata?.prompt || "")
        setHidePopup(false)
        setPopup({ x, y, target: target as fabric.GenerationFrame })
      } else {
        setPopup(null)
      }
    },
    [setHidePopup]
  )

  useEffect(() => {
    if (!editor) return

    setPopupForTarget(activeObject)
  }, [editor, activeObject, setPopupForTarget])

  const onModified = useCallback(
    (e: IEvent) => {
      if (e.target && popup && popup.target.id == e.target.id) {
        setPopupForTarget(activeObject)
      }
    },
    [activeObject, popup, setPopupForTarget]
  )

  const onMove = useCallback(() => {
    if (popup && !hidePopup) {
      setHidePopup(true)
    }
  }, [popup, hidePopup, setHidePopup])

  const onClick = useCallback(
    (e: IEvent) => {
      if (popup && hidePopup && e.target == popup.target) {
        setHidePopup(false)
      }
    },
    [popup, hidePopup, setHidePopup]
  )

  useEffect(() => {
    if (!editor) return

    editor.canvas.canvas.on("object:modified", onModified)
    editor.canvas.canvas.on("object:moving", onMove)
    editor.canvas.canvas.on("mouse:up", onClick)
    return () => {
      editor.canvas.canvas.off("object:modified", onModified)
      editor.canvas.canvas.off("object:moving", onMove)
      editor.canvas.canvas.off("mouse:up", onClick)
    }
  }, [editor, onClick, onModified, onMove])

  const onGenerateImage = useCallback(async () => {
    const targetId = popup?.target.id
    if (!targetId) return
    if (!popup.target.metadata?.prompt) return
    generateImage({
      frame: popup.target,
      editor: editor,
    })
  }, [popup, generateImage, editor])

  const onPromptChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (popup) {
        popup.target.metadata = {
          ...(popup.target.metadata || {}),
          prompt: e.target.value,
        }
        setPrompt(e.target.value)
      }
    },
    [popup]
  )

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
      {popup && !hidePopup && imageRequest.state != "loading" ? (
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
              id="actionPopupPrompt"
              type="text"
              onChange={onPromptChange}
              value={popup.target.metadata?.prompt || ""}
              style={{
                borderRadius: "5px",
                background: "#FFF",
                padding: "5px",
                flexGrow: "1",
                border: "1px solid #c4c4c4",
              }}
            />
            <Button size="compact" onClick={onGenerateImage}>
              Generate
            </Button>
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
