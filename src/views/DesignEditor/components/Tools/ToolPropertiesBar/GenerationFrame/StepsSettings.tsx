import { useActiveObject } from "@layerhub-io/react"
import { Block } from "baseui/block"
import { Button, KIND } from "baseui/button"
import { Input, SIZE } from "baseui/input"
import { PLACEMENT, StatefulPopover } from "baseui/popover"
import { Slider } from "baseui/slider"
import { StatefulTooltip } from "baseui/tooltip"
import { fabric } from "fabric"
import { useCallback, useEffect, useState } from "react"
import Steps from "../../../../../../components/Icons/Steps"

export const StepsSettings = () => {
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
                min={1}
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
