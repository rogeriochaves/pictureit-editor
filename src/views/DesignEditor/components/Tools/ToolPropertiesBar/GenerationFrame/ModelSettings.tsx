import { ModelTypes } from "@layerhub-io/objects"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import { OnChangeParams, Select, Value } from "baseui/select"
import { fabric } from "fabric"
import { useCallback, useEffect, useState } from "react"
import { renderToDetectModelToUse } from "../../../../../../state/generateImage"

export const ModelSettings = () => {
  const editor = useEditor()
  const frame = useActiveObject<fabric.GenerationFrame | undefined>()
  const [model, setModel] = useState<Value>([{ id: "stable-diffusion" }])

  useEffect(() => {
    if (!editor || !frame) return

    const { model } = frame.metadata || {}

    if (model) {
      setModel([{ id: model }])
    } else {
      renderToDetectModelToUse(editor, frame).then((model) => {
        setModel([{ id: model }])
      })
    }
  }, [editor, frame])

  const handleChange = useCallback(
    (params: OnChangeParams) => {
      if (!frame) return
      setModel(params.value)

      const model = params.value[0].id
      if (model) {
        frame.metadata = {
          ...(frame.metadata || {}),
          model: model as ModelTypes,
        }
      }
    },
    [frame]
  )

  const options: { label: string; id: ModelTypes }[] = [
    { label: "Stable Diffusion", id: "stable-diffusion" },
    { label: "Stable Diffusion Inpainting", id: "stable-diffusion-inpainting" },
  ]

  return (
    <Select
      backspaceRemoves={false}
      clearable={false}
      deleteRemoves={false}
      options={options}
      value={model}
      searchable={false}
      placeholder="Select color"
      onChange={handleChange}
      overrides={{
        ValueContainer: {
          style: () => ({
            backgroundColor: "white",
            padding: 0,
          }),
        },
        ControlContainer: {
          style: () => ({
            border: "none",
            backgroundColor: "white",
          }),
        },
        SelectArrow: {
          props: {
            overrides: {
              Svg: {
                style: () => ({
                  marginRight: "-8px",
                }),
              },
            },
          },
        },
      }}
    />
  )
}
