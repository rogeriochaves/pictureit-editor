import React from "react"
import InformationCircleOutline from "~/components/Icons/InformationCircleOutline"
import Underline from "~/components/Icons/Underline"
import Spacing from "~/components/Icons/Spacing"

import Shadow from "./Common/Shadow"
import { Input, SIZE } from "baseui/input"
import { Button } from "baseui/button"
import { ChevronRight } from "baseui/icon"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import { getTextOptions } from "~/utils/object-options"
import { fontStyleLabels } from "~/constants/fonts"
import { Select } from "baseui/select"
import { loadFonts } from "~/utils/fonts"
import { TextOptions } from "~/interfaces/editor"
import { defaultTextOptions } from "~/constants/contants"

const TextProperties = () => {
  const fonts = [] as any
  const [state, setState] = React.useState<TextOptions>(defaultTextOptions)
  const activeObject = useActiveObject() as any
  const editor = useEditor()

  React.useEffect(() => {
    if (activeObject) {
      const textOptions = getTextOptions(activeObject)
      const isGroup = textOptions.isGroup
      const active = textOptions.fontFamily.split("__")[1]
      const font = fonts.find((f: any) => f.family === textOptions.fontFamily.split("__")[0].split("_").join(" "))
      if (!font) {
        setState(defaultTextOptions)
        return
      }
      const isNotGradient = typeof activeObject.value?.fill === "string" || activeObject.value?.fill instanceof String
      const styles = Object.keys(font.files)
        .map((file: string) => ({
          value: file,
          label: (fontStyleLabels as any)[file].label,
          id: (fontStyleLabels as any)[file].id,
          url: font.files[file],
          family: font.family,
        }))
        .sort((a, b) => (a.id > b.id ? 1 : -1))

      setState({
        ...textOptions,
        font,
        styles,
        fontFamily: font.family,
        activeStyle: {
          label: (fontStyleLabels as any)[active].label,
          id: (fontStyleLabels as any)[active].id,
        },
        fill: isGroup ? "#000000" : isNotGradient ? textOptions.fill : "#000000",
      })
    } else {
      setState(defaultTextOptions)
    }
  }, [activeObject, fonts])

  const handleChange = async (key: string, value: any) => {
    if (key === "fontStyle") {
      const selected = value[0]
      const updatedFamily = `${selected.family.split(" ").join("_")}__${selected.value}`
      const font = {
        name: updatedFamily,
        url: selected.url,
      }
      await loadFonts([font])
      editor.objects.update({
        fontFamily: updatedFamily,
        metadata: {
          fontURL: font.url,
        },
      })
      setState({ ...state, activeStyle: selected })
    } else {
      editor.objects.update({
        [key]: value,
      })
      setState({ ...state, [key]: value })
    }
  }
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: 500,
          justifyContent: "space-between",
          padding: "1.5rem",
        }}
      >
        <div>Text properties</div>
        <InformationCircleOutline size={24} />
      </div>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <div style={{ padding: "0 1.5rem" }}>
          <Input
            overrides={{
              Root: {
                style: {
                  paddingRight: "0px",
                },
              },
            }}
            onFocus={() => {}}
            endEnhancer={<ChevronRight size="18px" />}
            size={SIZE.compact}
            value={state.fontFamily}
            placeholder="Controlled Input"
            clearOnEscape
          />
        </div>
        <div style={{ padding: "0 1.5rem", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.5rem" }}>
          <Input size={SIZE.compact} value={24} />

          <Select
            size={SIZE.compact}
            options={state.styles}
            // @ts-ignore
            value={[state.activeStyle]}
            placeholder="Select color"
            clearable={false}
            onChange={(params) => {
              // @ts-ignore
              handleChange("fontStyle", params.value)
            }}
          />
        </div>
      </div>
      <div style={{ padding: "0 1.5rem" }}>
        <Button size="compact" onClick={() => handleChange("underline", !activeObject.underline)} kind="tertiary">
          <Spacing size={24} />
        </Button>
        <Button size="compact" onClick={() => handleChange("underline", !activeObject.underline)} kind="tertiary">
          <Underline size={24} />
        </Button>
      </div>
      <div>
        <Shadow />
      </div>
    </div>
  )
}

export default TextProperties
