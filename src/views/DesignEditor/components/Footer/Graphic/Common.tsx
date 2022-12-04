import { useEditor, useZoomRatio } from "@layerhub-io/react"
import { styled } from "baseui"
import { Button, KIND, SIZE } from "baseui/button"
import { Input } from "baseui/input"
import { Slider } from "baseui/slider"
import { Theme } from "baseui/theme"
import React from "react"
import { useRecoilState } from "recoil"
import Icons from "~/components/Icons"
import { PanelType } from "../../../../../constants/app-options"
import { isSidebarOpenState } from "../../../../../state/designEditor"
import useAppContext from "../../../../../hooks/useAppContext"

const Container = styled<"div", object, Theme>("div", ({ $theme }) => ({
  height: "50px",
  background: $theme.colors.white,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}))

interface Options {
  zoomRatio: number
}

const Common = () => {
  const zoomMin = 10
  const zoomMax = 240
  const [options, setOptions] = React.useState<Options>({
    zoomRatio: 20,
  })
  const editor = useEditor()
  const zoomRatio: number = useZoomRatio()
  const { setActivePanel } = useAppContext()
  const [ isSidebarOpen, setIsSidebarOpen ] = useRecoilState(isSidebarOpenState)

  React.useEffect(() => {
    setOptions({ ...options, zoomRatio: Math.round(zoomRatio * 100) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomRatio])

  const handleChange = (type: string, value: any) => {
    if (value < 0) {
      editor.zoom.zoomToRatio(zoomMin / 100)
    } else if (value > zoomMax) {
      editor.zoom.zoomToRatio(zoomMax / 100)
    } else {
      editor.zoom.zoomToRatio(value / 100)
    }
  }

  return (
    <Container>
      <div>
        <Button
          kind={KIND.tertiary}
          size={SIZE.compact}
          onClick={() => {
            setActivePanel(PanelType.LAYERS)
            setIsSidebarOpen(!isSidebarOpen)
          }}
        >
          <Icons.Layers size={20} />
        </Button>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Button kind={KIND.tertiary} size={SIZE.compact} onClick={() => editor.zoom.zoomToFit()}>
          <Icons.Expand size={16} />
        </Button>
        <Button kind={KIND.tertiary} size={SIZE.compact} onClick={() => editor.zoom.zoomOut()}>
          <Icons.RemoveCircleOutline size={24} />
        </Button>
        <Slider
          overrides={{
            InnerThumb: () => null,
            ThumbValue: () => null,
            TickBar: () => null,
            Root: {
              style: { width: "140px" },
            },
            Thumb: {
              style: {
                height: "12px",
                width: "12px",
                paddingLeft: 0,
              },
            },
            Track: {
              style: {
                paddingLeft: 0,
                paddingRight: 0,
              },
            },
          }}
          value={[options.zoomRatio]}
          onChange={({ value }) => {
            handleChange("zoomRatio", value[0])
          }}
          min={zoomMin}
          max={zoomMax}
        />
        <Button kind={KIND.tertiary} size={SIZE.compact} onClick={() => editor.zoom.zoomIn()}>
          <Icons.AddCircleOutline size={24} />
        </Button>
        <Input
          type="number"
          value={options.zoomRatio}
          endEnhancer="%"
          overrides={{
            Root: {
              style: {
                width: "96px",
              },
            },
          }}
          size={SIZE.mini}
          max={zoomMax}
          min={zoomMin}
          onChange={(e: any) => handleChange("zoomRatio", e.target.value)}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "end" }}>
        <Button kind={KIND.tertiary} size={SIZE.compact} onClick={() => editor.history.undo()}>
          <Icons.Undo size={22} />
        </Button>
        <Button kind={KIND.tertiary} size={SIZE.compact} onClick={() => editor.history.redo()}>
          <Icons.Redo size={22} />
        </Button>
        {/* <Button kind={KIND.tertiary} size={SIZE.compact}>
          <Icons.TimePast size={16} />
        </Button> */}
      </div>
    </Container>
  )
}

export default Common
