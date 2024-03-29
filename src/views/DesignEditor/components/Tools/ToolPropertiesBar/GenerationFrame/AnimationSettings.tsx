import { useActiveObject } from "@layerhub-io/react"
import { Block } from "baseui/block"
import { Button, KIND } from "baseui/button"
import { Input, SIZE } from "baseui/input"
import { PLACEMENT, StatefulPopover } from "baseui/popover"
import { Slider } from "baseui/slider"
import { StatefulTooltip } from "baseui/tooltip"
import { fabric } from "fabric"
import { useCallback, useEffect, useState } from "react"
import VideoFrames from "../../../../../../components/Icons/VideoFrames"
import { DEFAULT_NUM_ANIMATION_FRAMES, DEFAULT_NUM_INTERPOLATION_STEPS } from "../../../../../../state/generateImage"

export const AnimationSettings = () => {
  const activeObject = useActiveObject<fabric.GenerationFrame | undefined>()
  const [state, setState] = useState<{
    numAnimationFrames: number
    numInterpolationSteps: number
  }>({ numAnimationFrames: DEFAULT_NUM_ANIMATION_FRAMES, numInterpolationSteps: DEFAULT_NUM_INTERPOLATION_STEPS })

  useEffect(() => {
    if (activeObject) {
      const { numAnimationFrames, numInterpolationSteps } = activeObject.metadata || {}
      setState({
        ...state,
        numAnimationFrames: numAnimationFrames || DEFAULT_NUM_ANIMATION_FRAMES,
        numInterpolationSteps: numInterpolationSteps || DEFAULT_NUM_INTERPOLATION_STEPS,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeObject])

  const handleChange = useCallback(
    (type: "numAnimationFrames" | "numInterpolationSteps", value: number[]) => {
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

  // TODO: what is this autofocus happening?

  return (
    <StatefulPopover
      showArrow={true}
      placement={PLACEMENT.bottom}
      content={() => (
        <Block padding="12px" width="200px" backgroundColor="#ffffff" display="grid" gridGap="8px">
          <Block>
            <Block display="flex" $style={{ fontSize: "13px", marginBottom: "12px", color: "#666" }}>
              <Block>Number of frames for the animation</Block>
            </Block>
            <Block $style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Block $style={{ fontSize: "14px" }}>Animation Frames</Block>
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
                  value={Math.round(state.numAnimationFrames)}
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
                min={3}
                max={15}
                // step
                marks={false}
                value={[state.numAnimationFrames]}
                onChange={({ value }) => handleChange("numAnimationFrames", value)}
              />
            </Block>
          </Block>
          <Block>
            <Block $style={{ fontSize: "13px", marginBottom: "12px", color: "#666" }}>
              {"Number of frames to add as interpolation between the main frames"}
            </Block>
            <Block $style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Block $style={{ fontSize: "14px" }}>Interpolation Steps</Block>
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
                  value={state.numInterpolationSteps}
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
                min={2}
                max={10}
                step={1}
                marks={false}
                value={[state.numInterpolationSteps]}
                onChange={({ value }) => handleChange("numInterpolationSteps", value)}
              />
            </Block>
          </Block>
        </Block>
      )}
    >
      <Block>
        <StatefulTooltip placement={PLACEMENT.bottom} showArrow={true} accessibilityType="tooltip" content="Animation Frames">
          <Button size={SIZE.mini} kind={KIND.tertiary}>
            <Block paddingRight="8px">{state.numAnimationFrames}</Block>
            <VideoFrames size={24} />
          </Button>
        </StatefulTooltip>
      </Block>
    </StatefulPopover>
  )
}
