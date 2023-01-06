import { LayerType } from "@layerhub-io/core"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import { Block } from "baseui/block"
import { Button, KIND, SIZE } from "baseui/button"
import { FormControl } from "baseui/form-control"
import { ChevronDown } from "baseui/icon"
import { StatefulMenu } from "baseui/menu"
import { Popover } from "baseui/popover"
import { PLACEMENT, StatefulTooltip } from "baseui/tooltip"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { DetailedHTMLProps, InputHTMLAttributes, useCallback, useEffect, useRef, useState } from "react"
import { useRecoilState, useRecoilValue, useRecoilValueLoadable } from "recoil"
import api from "../../../../api"
import { PICTURE_IT_URL } from "../../../../api/adapters/pictureit"
import Negative from "../../../../components/Icons/Negative"
import Question from "../../../../components/Icons/Question"
import Scrollable from "../../../../components/Scrollable"
import { generateActionState, generateImageCall, hidePopupState } from "../../../../state/generateImage"
import { tagSuggestionsCall } from "../../../../state/tagSuggestions"
import { useCallRecoilLazyLoadable, useRecoilValueLazyLoadable } from "../../../../utils/lazySelectorFamily"
import { useFrameModel } from "../Tools/ToolPropertiesBar/GenerationFrame/ModelSettings"

type Popup = {
  x: number
  y: number
  target: fabric.GenerationFrame
}

const ActionPopup = () => {
  const editor = useEditor()
  const activeObject = useActiveObject() as fabric.Object | undefined
  const [popup, setPopup] = useState<Popup | null>(null)
  const [prompt, setPrompt] = useState<string>("")
  const [isPromptFocused, setIsPromptFocused] = useState(false)
  const [negativePrompt, setNegativePrompt] = useState<string | undefined>(undefined)
  const [promptEnd, setPromptEnd] = useState<string | undefined>(undefined)
  const [hidePopup, setHidePopup] = useRecoilState(hidePopupState)
  const imageRequest = useRecoilValueLazyLoadable(generateImageCall(popup?.target.id))
  const [model] = useFrameModel(editor, popup?.target)

  useEffect(() => {
    if (!popup) return
    popup.target.metadata = {
      ...(popup.target.metadata || {}),
      prompt,
      negativePrompt,
      promptEnd,
    }
  }, [popup, prompt, negativePrompt, promptEnd])

  const setPopupForTarget = useCallback(
    (target: fabric.Object | undefined) => {
      if (
        target &&
        target.type == LayerType.GENERATION_FRAME &&
        target.oCoords &&
        target instanceof fabric.GenerationFrame
      ) {
        const { x, y } = target.oCoords.mt // mid-top
        setPrompt(target.metadata?.prompt || "")
        setNegativePrompt(target.metadata?.negativePrompt)
        setPromptEnd(target.metadata?.promptEnd)
        setHidePopup(false)
        setPopup({ x, y, target: target })
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

  const ImagePrompt = popup && (
    <>
      {negativePrompt === undefined && isPromptFocused && (
        <AddNegativePromptButton onClick={() => setNegativePrompt("")} />
      )}
      <PromptInput
        id="actionPopupPrompt"
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
        onFocus={() => setIsPromptFocused(true)}
        onBlur={() => setTimeout(() => setIsPromptFocused(false), 200)}
      />
      {negativePrompt !== undefined && (
        <Block display="flex">
          <RemoveNegativePromptButton
            onClick={() => {
              setNegativePrompt(undefined)
              document.getElementById("actionPopupPrompt")?.focus()
            }}
          />
          <NegativePromptInput popup={popup} negativePrompt={negativePrompt} setNegativePrompt={setNegativePrompt} />
        </Block>
      )}
    </>
  )

  const VideoPrompt = (
    <>
      <label style={{ fontSize: 13 }} htmlFor="actionPopupPrompt">
        Prompt Start:
      </label>
      <PromptInput id="actionPopupPrompt" onChange={(e) => setPrompt(e.target.value)} value={prompt} />
      <label style={{ fontSize: 13 }} htmlFor="actionPopupPromptEnd">
        Prompt End:
      </label>
      <PromptInput id="actionPopupPromptEnd" onChange={(e) => setPromptEnd(e.target.value)} value={promptEnd} />
    </>
  )

  const showTagSuggestions = model != "stable-diffusion-animation" && "isPictureIt" in api

  const videoPromptButtonAlignment =
    model == "stable-diffusion-animation"
      ? {
          alignItems: "flex-end",
        }
      : {}

  const noTagSuggestionsPadding = showTagSuggestions ? {} : { paddingBottom: "12px" }

  return (
    <ActionPopupLayout popup={popup}>
      {popup && !hidePopup && imageRequest.state != "loading" ? (
        <>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              ...videoPromptButtonAlignment,
              ...noTagSuggestionsPadding,
            }}
          >
            <div style={{ flexGrow: "1", display: "flex", position: "relative", flexDirection: "column", gap: "8px" }}>
              {model == "stable-diffusion-animation" ? VideoPrompt : ImagePrompt}
            </div>
            <GenerateButton popup={popup} />
          </div>
          {showTagSuggestions && <TagSuggestions prompt={prompt} setPrompt={setPrompt} />}
        </>
      ) : null}
    </ActionPopupLayout>
  )
}

const ActionPopupLayout = ({ popup, children }: { popup: Popup | null; children: React.ReactNode }) => {
  const popupRef = useRef<HTMLDivElement>(null)
  const popupInnerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const [width, setWidth] = useState(0)

  const popupRect = popupRef.current?.getBoundingClientRect()
  const minX = (popupRect?.x || 0) * -1 + 12
  const minY = (popupRect?.y || 0) * -1 + 12

  useEffect(() => {
    const popupInnerRect = popupInnerRef.current?.getBoundingClientRect()
    setHeight(popupInnerRect?.height || 0)
    setWidth(popupInnerRect?.width || 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup, children == null, popup?.target.metadata?.model])

  return (
    <div ref={popupRef}>
      {popup && children ? (
        <div
          ref={popupInnerRef}
          style={{
            position: "absolute",
            zIndex: 128,
            top: `${Math.max(popup.y - height - 32, minY)}px`,
            left: `${Math.max(popup.x - width / 2, minX)}px`,
            background: "#eeeaee",
            border: "1px solid #c4c4c4",
            padding: "12px 12px 0 12px",
            borderRadius: "10px",
            width: `500px`,
            boxShadow: "0px 0px 10px rgba(0,0,0,.2)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            opacity: height > 0 ? 1 : 0,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

const AddNegativePromptButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      style={{
        position: "absolute",
        right: "0",
        height: "100%",
        display: "flex",
        alignItems: "center",
        marginRight: "8px",
      }}
    >
      <StatefulTooltip
        overrides={{
          Body: {
            style: { zIndex: 129, marginBottom: "1px" },
          },
        }}
        accessibilityType={"tooltip"}
        placement={PLACEMENT.top}
        showArrow={true}
        content={
          <Block display="flex" $style={{ gap: "4px" }}>
            <Block>Add negative prompt</Block>
            <a title="Read more" href={`${PICTURE_IT_URL}/guides/negative-prompt`} rel="noreferrer" target="_blank">
              <Question size={16} variant="white" />
            </a>
          </Block>
        }
      >
        <Button size={SIZE.mini} kind={KIND.secondary} onClick={onClick}>
          + Neg
        </Button>
      </StatefulTooltip>
    </div>
  )
}

const RemoveNegativePromptButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <StatefulTooltip
      overrides={{
        Body: {
          style: { zIndex: 129, marginBottom: "1px" },
        },
      }}
      accessibilityType={"tooltip"}
      placement={PLACEMENT.top}
      showArrow={true}
      content={
        <Block display="flex" $style={{ gap: "4px" }}>
          <Block>What not to include in the picture</Block>
          <a title="Read more" href={`${PICTURE_IT_URL}/guides/negative-prompt`} rel="noreferrer" target="_blank">
            <Question size={16} variant="white" />
          </a>
        </Block>
      }
    >
      <button
        style={{
          height: "100%",
          border: "none",
          background: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: "8px",
        }}
        onClick={onClick}
      >
        <Negative size={24} color="#666" />
      </button>
    </StatefulTooltip>
  )
}

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

const TagSuggestions = ({
  prompt,
  setPrompt,
}: {
  prompt: string
  setPrompt: (callback: (current: string) => string) => void
}) => {
  const tagSuggestions = useTagSuggestions(prompt)

  const Pill = ({ value }: { value: string }) => {
    return (
      <button
        onClick={() => {
          setPrompt((prompt) => (prompt ? prompt + ", " : "") + value)
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

  return (
    <div>
      <Scrollable style={{ height: "37px" }}>
        <div style={{ display: "flex", gap: "8px", whiteSpace: "nowrap" }}>
          {tagSuggestions.map((tag) => (
            <Pill key={tag} value={tag} />
          ))}
        </div>
      </Scrollable>
    </div>
  )
}

const NegativePromptInput = ({
  popup,
  negativePrompt,
  setNegativePrompt,
}: {
  popup: Popup
  negativePrompt: string
  setNegativePrompt: (value: string) => void
}) => {
  const editor = useEditor()!
  const generateAction = useRecoilValue(generateActionState(popup.target.id))

  const [model] = useFrameModel(editor, popup.target)

  const disabledDueToUnsupportedAction = generateAction == "advance"
  const disabledDueToInpainting = model == "stable-diffusion-inpainting"
  const disabledDueToOpenJourney = model == "openjourney"
  const disabled = disabledDueToUnsupportedAction || disabledDueToInpainting || disabledDueToOpenJourney

  const promptInput = (
    <PromptInput disabled={!!disabled} onChange={(e) => setNegativePrompt(e.target.value)} value={negativePrompt} />
  )

  return disabled ? (
    <StatefulTooltip
      overrides={{
        Body: {
          style: { zIndex: 129 },
        },
      }}
      accessibilityType={"tooltip"}
      placement={PLACEMENT.top}
      showArrow={true}
      content={
        disabledDueToUnsupportedAction
          ? "Negative prompt is not available for Advance action"
          : disabledDueToInpainting
          ? "Negative prompt is not available for inpainting"
          : disabledDueToOpenJourney
          ? "Negative prompt is not available for OpenJourney"
          : "Negative prompt is not supported with the config combination"
      }
    >
      <Block style={{ flexGrow: 1, display: "flex" }}>{promptInput}</Block>
    </StatefulTooltip>
  ) : (
    promptInput
  )
}

const PromptInput = (props: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
  const disabledStyle = props.disabled ? { color: "#777", background: "#EEE", cursor: "not-allowed" } : {}

  return (
    <input
      type="text"
      autoComplete="off"
      {...props}
      style={{
        borderRadius: "5px",
        background: "#FFF",
        padding: "5px",
        flexGrow: "1",
        border: "1px solid #c4c4c4",
        height: "30px",
        ...disabledStyle,
        ...(props.style || {}),
      }}
    />
  )
}

const GenerateButton = ({ popup }: { popup: Popup }) => {
  const editor = useEditor()
  const [model] = useFrameModel(editor, popup.target)
  const generateImage = useCallRecoilLazyLoadable(generateImageCall(popup.target.id))
  const [isGenerateActionOptionsOpen, setIsGenerateActionOptionsOpen] = useState(false)
  const [generateAction, setGenerateAction] = useRecoilState(generateActionState(popup.target.id))

  const onGenerateImage = useCallback(async () => {
    if (!editor) return

    const targetId = popup?.target.id
    if (!targetId) return
    if (!popup.target.metadata?.prompt) return
    if (model == "stable-diffusion-animation" && !popup.target.metadata?.promptEnd) return
    generateImage({
      frame: popup.target,
      editor: editor,
      advanceSteps: generateAction == "advance",
    })
  }, [editor, popup.target, model, generateImage, generateAction])

  return popup?.target.getImage() && model == "stable-diffusion" ? (
    <Block display="flex" alignItems="flex-start">
      <Button
        style={{ height: "42px" }}
        size="compact"
        onClick={onGenerateImage}
        overrides={{
          BaseButton: {
            style: {
              borderTopRightRadius: "0",
              borderBottomRightRadius: "0",
              paddingRight: "6px",
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
            style={{ height: "42px" }}
            size="compact"
            kind={KIND.primary}
            onClick={() => setIsGenerateActionOptionsOpen((x) => !x)}
            overrides={{
              BaseButton: {
                style: {
                  borderTopLeftRadius: "0",
                  borderBottomLeftRadius: "0",
                  paddingLeft: "6px",
                  borderLeftWidth: "1px",
                  borderLeftColor: "#444",
                  borderLeftStyle: "solid",
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
    <Button size="compact" style={{ height: "42px" }} onClick={onGenerateImage}>
      Generate
    </Button>
  )
}

export default ActionPopup
