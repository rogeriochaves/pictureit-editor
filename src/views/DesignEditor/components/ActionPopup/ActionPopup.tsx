import { LayerType } from "@layerhub-io/core"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import { Block } from "baseui/block"
import { Button, KIND } from "baseui/button"
import { ChevronDown } from "baseui/icon"
import { StatefulMenu } from "baseui/menu"
import { Popover, StatefulPopover } from "baseui/popover"
import { PLACEMENT, StatefulTooltip } from "baseui/tooltip"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { useCallback, useEffect, useRef, useState } from "react"
import { useRecoilState, useRecoilValueLoadable } from "recoil"
import Scrollable from "../../../../components/Scrollable"
import { generateActionState, generateImageCall, hidePopupState } from "../../../../state/generateImage"
import { tagSuggestionsCall } from "../../../../state/tagSuggestions"
import {
  useCallRecoilLazyLoadable,
  useRecoilLazyLoadable,
  useRecoilValueLazyLoadable,
} from "../../../../utils/lazySelectorFamily"

const useTagSuggestions = (promptValue: string) => {
  const [tagSuggestionsKey, setTagSuggestionsKey] = useState("")
  const [lastTagSuggestions, setLastTagSuggestions] = useState<string[]>([])
  const tagSuggestions = useRecoilValueLoadable(tagSuggestionsCall(tagSuggestionsKey))

  useEffect(() => {
    setTagSuggestionsKey(promptValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptValue?.split(",").length])

  useEffect(() => {
    if (tagSuggestions.state == "hasValue" && tagSuggestions.contents) {
      setLastTagSuggestions(tagSuggestions.contents)
    }
  }, [tagSuggestions])

  return lastTagSuggestions
}

type Popup = {
  x: number
  y: number
  target: fabric.GenerationFrame
}

const ActionPopup = () => {
  const editor = useEditor()
  const popupRef = useRef<HTMLDivElement>(null)
  const activeObject = useActiveObject() as fabric.Object | undefined
  const [popup, setPopup] = useState<Popup | null>(null)
  const [_, setPrompt] = useState("")
  const [hidePopup, setHidePopup] = useRecoilState(hidePopupState)
  const imageRequest = useRecoilValueLazyLoadable(generateImageCall(popup?.target.id))
  const promptValue = popup?.target.metadata?.prompt || ""

  const tagSuggestions = useTagSuggestions(promptValue)

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

  const onPromptChange = useCallback(
    (e: { target: { value: string } }) => {
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
      <button
        onClick={() => {
          if (!popup) return

          const newPrompt = (promptValue ? promptValue + ", " : "") + value
          onPromptChange({ target: { value: newPrompt } })
        }}
        style={{
          borderRadius: "100px",
          background: "#ccc",
          padding: "5px 12px 5px 12px",
          fontSize: "13px",
          border: "none",
          fontFamily: "Uber Move Text, sans-serif",
          cursor: "pointer",
        }}
      >
        {value}
      </button>
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
            padding: "12px 12px 0 12px",
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
              autoComplete="off"
              value={promptValue || ""}
              style={{
                borderRadius: "5px",
                background: "#FFF",
                padding: "5px",
                flexGrow: "1",
                border: "1px solid #c4c4c4",
              }}
            />
            <GenerateButton popup={popup} />
          </div>
          <div>
            <Scrollable style={{ height: "37px" }}>
              <div style={{ display: "flex", gap: "8px", whiteSpace: "nowrap" }}>
                {tagSuggestions.map((tag) => (
                  <Pill key={tag} value={tag} />
                ))}
              </div>
            </Scrollable>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const GenerateButton = ({ popup }: { popup: Popup }) => {
  const editor = useEditor()
  const generateImage = useCallRecoilLazyLoadable(generateImageCall(popup.target.id))
  const [isGenerateActionOptionsOpen, setIsGenerateActionOptionsOpen] = useState(false)
  const [generateAction, setGenerateAction] = useRecoilState(generateActionState(popup.target.id))

  const onGenerateImage = useCallback(
    async ({ advanceSteps = false }: { advanceSteps?: boolean }) => {
      if (!editor) return

      const targetId = popup?.target.id
      if (!targetId) return
      if (!popup.target.metadata?.prompt) return
      generateImage({
        frame: popup.target,
        editor: editor,
        advanceSteps,
      })
    },
    [popup, generateImage, editor]
  )

  return popup?.target.getImage() ? (
    <Block display="flex">
      <Button
        size="compact"
        onClick={() => onGenerateImage({})}
        overrides={{
          BaseButton: {
            style: {
              borderRadius: "8px 0 0 8px",
              padding: "10px 6px 10px 12px",
            },
          },
        }}
      >
        {generateAction == "generate" ? "Generate" : "Advance"}
      </Button>
      <Popover
        isOpen={isGenerateActionOptionsOpen}
        showArrow={false}
        placement={PLACEMENT.bottomRight}
        content={() => (
          <StatefulMenu
            onItemSelect={({ item }) => {
              if (item.action == "generate") {
                setGenerateAction("generate")
              }
              if (item.action == "advance") {
                setGenerateAction("advance")
              }
              setIsGenerateActionOptionsOpen(false)
            }}
            items={[
              {
                label: "Generate",
                action: "generate",
                selected: generateAction == "generate",
                tip: "Generate a new image based on prompt and base image",
              },
              {
                label: "Advance",
                action: "advance",
                selected: generateAction == "advance",
                tip: "Run more diffusion steps on currently generated image",
              },
            ]}
            overrides={{
              List: {
                style: {
                  width: "110px",
                  borderRadius: "8px",
                },
              },
              Option: {
                props: {
                  getSelection: () => {
                    return "foo"
                  },
                  getItemLabel: (item: any) => (
                    <StatefulTooltip
                      overrides={{
                        Body: {
                          style: { zIndex: 129, background: "#AAA", left: "190px", width: "200px" },
                        },
                      }}
                      accessibilityType={"tooltip"}
                      placement={PLACEMENT.left}
                      showArrow={true}
                      content={item.tip}
                    >
                      {item.selected ? (
                        <Block style={{ color: "#111", fontWeight: "bold" }}>{item.label}</Block>
                      ) : (
                        <Block>{item.label}</Block>
                      )}
                    </StatefulTooltip>
                  ),
                },
              },
            }}
          />
        )}
        overrides={{
          Body: {
            style: {
              zIndex: 129,
              borderRadius: "8px",
            },
          },
          Inner: {
            style: {
              borderRadius: "8px",
            },
          },
        }}
      >
        <Block>
          <Button
            size="compact"
            kind={KIND.primary}
            onClick={() => setIsGenerateActionOptionsOpen((x) => !x)}
            overrides={{
              BaseButton: {
                style: {
                  borderRadius: "0 8px 8px 0",
                  padding: "10px 6px 10px 6px",
                  borderLeft: "1px solid #444",
                },
              },
            }}
          >
            <ChevronDown size={18} />
          </Button>
        </Block>
      </Popover>
    </Block>
  ) : (
    <Button size="compact" onClick={() => onGenerateImage({ advanceSteps: generateAction == "advance" })}>
      Generate
    </Button>
  )
}

export default ActionPopup
