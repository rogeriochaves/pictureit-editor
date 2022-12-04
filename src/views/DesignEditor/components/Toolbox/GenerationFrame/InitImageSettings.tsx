import { transparentB64 } from "@layerhub-io/core"
import { InitImage } from "@layerhub-io/objects"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import { Block } from "baseui/block"
import { Button, KIND } from "baseui/button"
import { Input, SIZE } from "baseui/input"
import { PLACEMENT, StatefulPopover } from "baseui/popover"
import { Slider } from "baseui/slider"
import { StatefulTooltip } from "baseui/tooltip"
import { fabric } from "fabric"
import { IEvent } from "fabric/fabric-impl"
import { debounce } from "lodash"
import { useCallback, useEffect, useState } from "react"
import NoColor from "../../../../../components/Icons/NoColor"
import { DEFAULT_PROMPT_STRENGTH, renderInitImage, renderNewInitImage } from "../../../../../store/generation"
import { ColorSquare } from "../Shared/ColorSquare"

export const InitImageSettings = () => {
  const editor = useEditor()
  const activeObject = useActiveObject<fabric.GenerationFrame | undefined>()
  const [localNoise, setLocalNoise] = useState<number>(activeObject?.getNoise?.() ?? 0)
  const [localPromptStrength, setLocalPromptStrength] = useState<number>(
    activeObject?.metadata?.initImage?.promptStrength ?? DEFAULT_PROMPT_STRENGTH
  )
  const [initImageWithNoise, setInitImageWithNoise] = useState<string | undefined>()
  const [currentCanvasImage, setCurrentCanvasImage] = useState<string | undefined>()

  const setInitImage = useCallback(
    (initImage: Partial<InitImage>) => {
      if (activeObject) {
        activeObject.metadata = {
          ...(activeObject.metadata || {}),
          initImage: {
            ...(activeObject.metadata?.initImage || { fixed: false }),
            ...initImage,
          },
        }
        setLocalNoise(activeObject.getNoise())
      }
    },
    [activeObject]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateInitImage = useCallback(
    debounce(async (then: (() => void) | undefined = undefined) => {
      if (activeObject) {
        const [_initImage, initImageWithNoise] = await renderInitImage(editor, activeObject, false)

        setInitImageWithNoise(initImageWithNoise)

        then?.()
      }
    }, 200),
    [activeObject, editor]
  )

  const onModified = useCallback(
    (e: IEvent) => {
      if (e.target == activeObject) {
        if (!activeObject?.metadata?.initImage?.fixed) {
          updateInitImage()
        }
      }
    },
    [activeObject, updateInitImage]
  )

  const onChangeNoise = useCallback(
    ({ value }: { value: number[] }) => {
      setInitImage({ noise: value[0] })

      updateInitImage()
    },
    [setInitImage, updateInitImage]
  )

  const onChangePromptStrength = useCallback(
    ({ value }: { value: number[] }) => {
      setLocalPromptStrength(value[0])

      setInitImage({ promptStrength: value[0] })
    },
    [setInitImage]
  )

  const onOpenPopover = useCallback(async () => {
    if (activeObject) {
      if (activeObject.metadata?.initImage?.fixed) {
        const canvasImage = await renderNewInitImage(editor, activeObject)

        if (canvasImage) {
          setCurrentCanvasImage(canvasImage.toDataURL("image/png"))
        }
      } else {
        setCurrentCanvasImage(undefined)
      }
    }
  }, [activeObject, editor])

  const onClickNoInitImage = useCallback(() => {
    if (activeObject && activeObject._objects) {
      const toRemove = activeObject._objects.filter((object) => !object.id.match(/(-background|-image)$/))
      activeObject.remove(...toRemove)
      editor.canvas.canvas.requestRenderAll()
      editor.history.save()
      setInitImage({ fixed: true, image: undefined })
      setInitImageWithNoise(undefined)
      onOpenPopover()
    }
  }, [activeObject, editor, onOpenPopover, setInitImage])

  const onClickCanvasAsInit = useCallback(() => {
    setInitImage({ fixed: false, image: undefined, noise: 0 })

    updateInitImage(() => {
      setCurrentCanvasImage(undefined)
    })
  }, [setInitImage, updateInitImage])

  useEffect(() => {
    editor.canvas.canvas.on("object:modified", onModified)
    updateInitImage()

    return () => {
      editor.canvas.canvas.off("object:modified", onModified)
    }
  }, [editor, onModified, updateInitImage])

  if (!activeObject) return null

  const noInitImageButton = (
    <ColorSquare>
      <Button size={SIZE.mini} kind={KIND.tertiary} onClick={onClickNoInitImage}>
        <NoColor size={24} />
      </Button>
    </ColorSquare>
  )

  const currentCanvasAsInitButton = currentCanvasImage ? (
    <Button size={SIZE.mini} kind={KIND.tertiary} onClick={onClickCanvasAsInit}>
      <ColorSquare>
        <img height={24} src={currentCanvasImage} />
      </ColorSquare>
    </Button>
  ) : null

  return (
    <StatefulPopover
      showArrow={true}
      placement={PLACEMENT.bottom}
      stateReducer={(_type, next) => {
        if (next.isOpen) {
          onOpenPopover()
        }
        return next
      }}
      content={() => (
        <Block padding="12px" width="200px" backgroundColor="#ffffff" display="grid" gridGap="8px">
          {initImageWithNoise ? (
            <Block display="flex" flexDirection="column" gridGap="8px">
              <Block>Base Image</Block>
              <Block display="flex" gridGap="8px" alignItems="center">
                {noInitImageButton}
                {currentCanvasAsInitButton}
              </Block>

              <Block $style={{ background: `url(${transparentB64})` }}>
                <img width="200" src={initImageWithNoise} style={{ display: "block" }} />
              </Block>

              <NoiseSlider localNoise={localNoise} onChangeNoise={onChangeNoise} />
              <PromptStrengthSlider
                promptStrength={localPromptStrength}
                onChangePromptStrength={onChangePromptStrength}
              />
            </Block>
          ) : !activeObject.metadata?.initImage?.fixed && !currentCanvasImage ? (
            <Block display="flex" gridGap="8px" alignItems="center">
              {noInitImageButton}
              <Block>No base image</Block>
            </Block>
          ) : (
            <Block display="flex" flexDirection="column" gridGap="8px">
              <Block>Base Image</Block>
              <Block display="flex" gridGap="8px" alignItems="center">
                {noInitImageButton}
                {currentCanvasAsInitButton}
              </Block>
            </Block>
          )}
        </Block>
      )}
    >
      <Block>
        <StatefulTooltip
          placement={PLACEMENT.bottom}
          showArrow={true}
          accessibilityType="tooltip"
          content="Base Image"
        >
          <Button kind={KIND.tertiary} size={SIZE.mini}>
            <ColorSquare>
              {initImageWithNoise ? <img height="24" src={initImageWithNoise} /> : <NoColor size={24} />}
            </ColorSquare>
          </Button>
        </StatefulTooltip>
      </Block>
    </StatefulPopover>
  )
}

const NoiseSlider = ({
  localNoise,
  onChangeNoise,
}: {
  localNoise: number
  onChangeNoise: (value: { value: number[] }) => void
}) => {
  return (
    <>
      <Block $style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Block $style={{ fontSize: "14px" }}>Noise</Block>
        <Block width="52px">
          <Input
            overrides={{
              Input: {
                style: {
                  backgroundColor: "#ffffff",
                  textAlign: "center",
                },
              },
              Root: {
                style: {
                  borderBottomColor: "rgba(0,0,0,0.15)",
                  borderTopColor: "rgba(0,0,0,0.15)",
                  borderRightColor: "rgba(0,0,0,0.15)",
                  borderLeftColor: "rgba(0,0,0,0.15)",
                  borderTopWidth: "1px",
                  borderBottomWidth: "1px",
                  borderRightWidth: "1px",
                  borderLeftWidth: "1px",
                  height: "26px",
                },
              },
              InputContainer: {},
            }}
            size={SIZE.mini}
            onChange={() => {}}
            value={Math.round(localNoise)}
          />
        </Block>
      </Block>

      <Block>
        <Slider
          overrides={{
            InnerThumb: () => null,
            ThumbValue: () => null,
            TickBar: () => null,
            Track: {
              style: {
                paddingRight: 0,
                paddingLeft: 0,
              },
            },
            Thumb: {
              style: {
                height: "12px",
                width: "12px",
              },
            },
          }}
          min={0}
          max={10}
          marks={false}
          value={[localNoise]}
          onChange={onChangeNoise as any}
        />
      </Block>
    </>
  )
}

const PromptStrengthSlider = ({
  promptStrength,
  onChangePromptStrength,
}: {
  promptStrength: number
  onChangePromptStrength: (value: { value: number[] }) => void
}) => {
  return (
    <>
      <Block $style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Block $style={{ fontSize: "14px" }}>Prompt Strength</Block>
        <Block width="52px">
          <Input
            overrides={{
              Input: {
                style: {
                  backgroundColor: "#ffffff",
                  textAlign: "center",
                },
              },
              Root: {
                style: {
                  borderBottomColor: "rgba(0,0,0,0.15)",
                  borderTopColor: "rgba(0,0,0,0.15)",
                  borderRightColor: "rgba(0,0,0,0.15)",
                  borderLeftColor: "rgba(0,0,0,0.15)",
                  borderTopWidth: "1px",
                  borderBottomWidth: "1px",
                  borderRightWidth: "1px",
                  borderLeftWidth: "1px",
                  height: "26px",
                },
              },
              InputContainer: {},
            }}
            size={SIZE.mini}
            onChange={() => {}}
            value={promptStrength}
          />
        </Block>
      </Block>

      <Block>
        <Slider
          overrides={{
            InnerThumb: () => null,
            ThumbValue: () => null,
            TickBar: () => null,
            Track: {
              style: {
                paddingRight: 0,
                paddingLeft: 0,
              },
            },
            Thumb: {
              style: {
                height: "12px",
                width: "12px",
              },
            },
          }}
          min={0}
          max={1}
          step={0.1}
          marks={false}
          value={[promptStrength]}
          onChange={onChangePromptStrength as any}
        />
      </Block>
    </>
  )
}
