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
import { DEFAULT_NOISE, renderInitImage, setHidePopup } from "../../../../store/generation"
import { useAppDispatch } from "../../../../store/store"
import Common from "./Common"
import { Separator } from "./Shared/Separator"
import { ColorSquare } from "./Shared/ColorSquare"
import { debounce } from "lodash"

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
  const [_, setInitImage] = useState<InitImage | undefined>()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateInitImage = useCallback(
    debounce(async () => {
      if (activeObject && !activeObject.metadata?.initImage?.fixed) {
        const image = await renderInitImage(editor, activeObject)

        setInitImage({ image, fixed: false })
        activeObject.metadata = {
          ...(activeObject.metadata || {}),
          initImage: {
            ...(activeObject.metadata?.initImage || {}),
            image,
            fixed: false,
          },
        }
      }
    }, 200),
    [activeObject, editor]
  )

  const onModified = useCallback(
    (e: IEvent) => {
      if (e.target == activeObject) {
        updateInitImage()
      }
    },
    [activeObject, updateInitImage]
  )

  const onChangeNoise = useCallback(
    ({ value }: { value: number }) => {
      if (activeObject) {
        activeObject.metadata = {
          ...(activeObject.metadata || {}),
          initImage: {
            ...(activeObject.metadata?.initImage || { fixed: false }),
            noise: value,
          },
        }
        setInitImage(activeObject.metadata.initImage)

        updateInitImage()
      }
    },
    [activeObject, updateInitImage]
  )

  useEffect(() => {
    editor.canvas.canvas.on("object:modified", onModified)
    updateInitImage()

    return () => {
      editor.canvas.canvas.off("object:modified", onModified)
    }
  }, [editor, onModified, updateInitImage])

  return (
    <StatefulPopover
      showArrow={true}
      placement={PLACEMENT.bottom}
      content={() => (
        <Block padding="12px" width="200px" backgroundColor="#ffffff" display="grid" gridGap="8px">
          {activeObject?.metadata?.initImage?.image ? (
            <Block display="flex" flexDirection="column" gridGap="8px">
              <Block>
                <Button size={SIZE.mini} kind={KIND.tertiary}>
                  <ColorSquare>
                    <NoColor size={24} />
                  </ColorSquare>
                </Button>
              </Block>
              <img width="200" src={activeObject.metadata.initImage.image} />

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
                    value={Math.round(activeObject.metadata.initImage.noise || DEFAULT_NOISE)}
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
                  value={[activeObject.metadata.initImage.noise || DEFAULT_NOISE]}
                  onChange={onChangeNoise as any}
                />
              </Block>
            </Block>
          ) : (
            <Block display="flex" gridGap="8px" alignItems="center">
              <ColorSquare>
                <NoColor size={24} />
              </ColorSquare>
              <Block>No init image</Block>
            </Block>
          )}
        </Block>
      )}
    >
      <Block>
        <ColorSquare>
          {activeObject?.metadata?.initImage?.image ? (
            <img height="24" src={activeObject.metadata.initImage.image} />
          ) : (
            <NoColor size={24} />
          )}
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
