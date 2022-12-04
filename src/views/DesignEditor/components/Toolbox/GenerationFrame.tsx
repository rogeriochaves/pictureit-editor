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
import React, { ChangeEvent, useCallback, useEffect, useState } from "react"
import NoColor from "../../../../components/Icons/NoColor"
import Steps from "../../../../components/Icons/Steps"
import { DEFAULT_NOISE, renderInitImage, renderNewInitImage, setHidePopup } from "../../../../store/generation"
import { useAppDispatch } from "../../../../store/store"
import Common from "./Common"
import { Separator } from "./Shared/Separator"
import { ColorSquare } from "./Shared/ColorSquare"
import { debounce } from "lodash"
import { addGaussianNoise } from "../../../../utils/noise"

const GenerationFrame = () => {
  const dispatch = useAppDispatch()
  const activeObject = useActiveObject<fabric.GenerationFrame | undefined>()

  if (!activeObject) return null

  return (
    <Block
      onClick={() => {
        dispatch(setHidePopup(true))
      }}
      $style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        justifyContent: "space-between",
      }}
    >
      <Block display="flex" gridGap="0.5rem" alignItems="center">
        <Block>{activeObject.name}</Block>
        <Separator />
        <InitImageSettings />
        <Separator />
        <StepsSettings />
        <Separator />
      </Block>
      <Common />
    </Block>
  )
}

const InitImageSettings = () => {
  const editor = useEditor()
  const activeObject = useActiveObject<fabric.GenerationFrame | undefined>()
  const [localNoise, setLocalNoise] = useState<number>(DEFAULT_NOISE)
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
        const noise = activeObject.metadata.initImage?.noise
        setLocalNoise(typeof noise == "undefined" ? DEFAULT_NOISE : noise)
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
    ({ value }: { value: number }) => {
      setInitImage({ noise: value })

      updateInitImage()
    },
    [setInitImage, updateInitImage]
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
              <Block>Init Image</Block>
              <Block display="flex" gridGap="8px" alignItems="center">
                {noInitImageButton}
                {currentCanvasAsInitButton}
              </Block>

              <img width="200" src={initImageWithNoise} />

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
                  // step
                  marks={false}
                  value={[localNoise]}
                  onChange={onChangeNoise as any}
                />
              </Block>
            </Block>
          ) : !activeObject.metadata?.initImage?.fixed && !currentCanvasImage ? (
            <Block display="flex" gridGap="8px" alignItems="center">
              {noInitImageButton}
              <Block>No init image</Block>
            </Block>
          ) : (
            <Block display="flex" flexDirection="column" gridGap="8px">
              <Block>Init Image</Block>
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
        <ColorSquare>
          {initImageWithNoise ? <img height="24" src={initImageWithNoise} /> : <NoColor size={24} />}
        </ColorSquare>
      </Block>
    </StatefulPopover>
  )
}

const StepsSettings = () => {
  const activeObject = useActiveObject<fabric.GenerationFrame | undefined>()
  const [state, setState] = useState<{
    steps: number
    guidance: number
  }>({ steps: 50, guidance: 7.5 })

  useEffect(() => {
    if (activeObject) {
      const { steps, guidance } = activeObject.metadata || {}
      setState({ ...state, steps: steps || 50, guidance: guidance || 7.5 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeObject])

  const handleChange = useCallback(
    (type: "steps" | "guidance", value: number[]) => {
      if (activeObject) {
        setState({ ...state, [type]: value[0] })

        activeObject.metadata = {
          ...(activeObject.metadata || {}),
          [type]: value[0],
        }
      }
    },
    [activeObject, state]
  )

  return (
    <StatefulPopover
      showArrow={true}
      placement={PLACEMENT.bottom}
      content={() => (
        <Block padding="12px" width="200px" backgroundColor="#ffffff" display="grid" gridGap="8px">
          <Block>
            <Block $style={{ fontSize: "13px", marginBottom: "12px", color: "#666" }}>
              More steps take longer, but may increase the quality
            </Block>
            <Block $style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Block $style={{ fontSize: "14px" }}>Steps</Block>
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
                  value={Math.round(state.steps)}
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
                max={100}
                // step
                marks={false}
                value={[state.steps]}
                onChange={({ value }) => handleChange("steps", value)}
              />
            </Block>
          </Block>
          <Block>
            <Block $style={{ fontSize: "13px", marginBottom: "12px", color: "#666" }}>
              {"How much should the model adhere to the prompt"}
            </Block>
            <Block $style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Block $style={{ fontSize: "14px" }}>Guidance</Block>
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
                  value={state.guidance}
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
                min={1}
                max={20}
                step={0.1}
                marks={false}
                value={[state.guidance]}
                onChange={({ value }) => handleChange("guidance", value)}
              />
            </Block>
          </Block>
        </Block>
      )}
    >
      <Block>
        <StatefulTooltip placement={PLACEMENT.bottom} showArrow={true} accessibilityType="tooltip" content="Steps">
          <Button size={SIZE.mini} kind={KIND.tertiary}>
            <Block paddingRight="8px">{state.steps}</Block>
            <Steps size={24} />
          </Button>
        </StatefulTooltip>
      </Block>
    </StatefulPopover>
  )
}

export default GenerationFrame
