import { Block } from "baseui/block"
import { Button, KIND, SIZE } from "baseui/button"
import { Input } from "baseui/input"
import { PLACEMENT, StatefulPopover } from "baseui/popover"
import { Slider } from "baseui/slider"
import { StatefulTooltip } from "baseui/tooltip"
import { JSXElementConstructor } from "react"

export const BrushSize = ({
  title,
  brushSize,
  setBrushSize,
  icon,
}: {
  title: string
  brushSize: number
  setBrushSize: (value: number) => void
  icon: JSXElementConstructor<{ size: number }>
}) => {
  const Icon = icon

  return (
    <StatefulPopover
      placement={PLACEMENT.bottomLeft}
      content={() => (
        <Block width="200px" backgroundColor="#ffffff" padding="20px">
          <Block $style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Block $style={{ fontSize: "14px" }}>{title}</Block>
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
                value={Math.round(brushSize)}
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
              marks={false}
              value={[brushSize]}
              // @ts-ignore
              onChange={({ value }) => setBrushSize(value)}
            />
          </Block>
        </Block>
      )}
    >
      <Block>
        <StatefulTooltip placement={PLACEMENT.bottom} showArrow={true} accessibilityType="tooltip" content={title}>
          <Button kind={KIND.tertiary} size={SIZE.mini}>
            <Icon size={16} />
            <Block paddingLeft="8px">{brushSize}</Block>
          </Button>
        </StatefulTooltip>
      </Block>
    </StatefulPopover>
  )
}
