import { LayerType } from "@layerhub-io/core"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import { Button, KIND } from "baseui/button"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { nanoid } from "nanoid"
import { useCallback, useEffect, useRef, useState } from "react"

type RemoteData<T> = { state: "NOT_ASKED" } | { state: "LOADING" } | { state: "SUCCESS"; data: T } | { state: "ERROR" }

const ActionPopup = () => {
  const editor = useEditor()
  const popupRef = useRef<HTMLDivElement>(null)
  const activeObject = useActiveObject() as fabric.Object | undefined
  const [popup, setPopup] = useState<{
    x: number
    y: number
    target: fabric.GenerationFrame
    isMoving: boolean
  } | null>(null)
  const [prompt, setPrompt] = useState("")
  const [generatingState, setGeneratingState] = useState<{ [key: string]: RemoteData<{ image: String }> }>({})

  const setPopupForTarget = (target: fabric.Object | undefined) => {
    if (target && target.type == LayerType.GENERATION_FRAME && target.oCoords) {
      const { x, y } = target.oCoords.mt // mid-top
      setPopup({ x, y, target: target as fabric.GenerationFrame, isMoving: false })
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

  const generateImage = useCallback(() => {
    const targetId = popup?.target.id
    if (!targetId) return

    setGeneratingState({
      ...generatingState,
      [targetId]: { state: "LOADING" },
    })

    setTimeout(async () => {
      setGeneratingState({
        ...generatingState,
        [targetId]: { state: "SUCCESS", data: { image: sampleImage } },
      })

      await popup.target.setImage(sampleImage)
      editor.objects.afterAddHook(popup.target as fabric.Object)

      setTimeout(async () => {
        await popup.target.setImage("https://pictureit.art/serve/picture/03b92f0f-highly-detailed-netherland-dua.webp")
        editor.objects.afterAddHook(popup.target as fabric.Object)
      }, 1000)
    }, 1000)
  }, [popup, generatingState])

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
  const currentGeneratingState = (popup && generatingState[popup.target.id]) || { state: "NOT_ASKED" }

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
          {currentGeneratingState.state == "LOADING" ? (
            <div>Loading...</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  id="actionPopupPrompt"
                  type="text"
                  onChange={(e) => setPrompt(e.target.value)}
                  value={prompt}
                  style={{
                    borderRadius: "5px",
                    background: "#FFF",
                    padding: "5px",
                    flexGrow: "1",
                    border: "1px solid #c4c4c4",
                  }}
                />
                <Button size="compact" onClick={generateImage}>
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
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

const sampleImage =
  "data:image/webp;base64,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"

export default ActionPopup
