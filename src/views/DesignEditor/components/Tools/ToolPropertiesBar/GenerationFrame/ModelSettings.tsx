import { Editor } from "@layerhub-io/core"
import { ModelTypes } from "@layerhub-io/objects"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import { OnChangeParams, Select } from "baseui/select"
import { fabric } from "fabric"
import { useCallback, useEffect } from "react"
import { atom, RecoilState, useRecoilState } from "recoil"
import { renderToDetectModelToUse } from "../../../../../../state/generateImage"

const frameModelState: RecoilState<ModelTypes> = atom({
  key: "frameModelState",
  default: "stable-diffusion" as ModelTypes,
})

// Prevent multiple components from rerendering frame every time just to detect the model to be used
let useEffectRegistered = false

// Wrapps chosen model attached to the frame, or auto-detect one if not set
export const useFrameModel = (
  editor: Editor | null,
  frame: fabric.GenerationFrame | undefined
): [ModelTypes, (model: ModelTypes) => void] => {
  const [model, setModelPrivate] = useRecoilState(frameModelState)

  useEffect(() => {
    if (!editor || !frame) return
    if (useEffectRegistered) return

    const { model } = frame.metadata || {}

    if (model) {
      setModelPrivate(model)
    } else {
      renderToDetectModelToUse(editor, frame).then((model) => {
        setModelPrivate(model)
      })
    }

    useEffectRegistered = true
    return () => {
      useEffectRegistered = false
    }
  }, [editor, frame, setModelPrivate])

  const setModel = useCallback(
    (model: ModelTypes) => {
      if (!frame) return

      if (model) {
        setModelPrivate(model as ModelTypes)
        frame.metadata = {
          ...(frame.metadata || {}),
          model: model as ModelTypes,
        }
      }
    },
    [frame, setModelPrivate]
  )

  return [model, setModel]
}

export const ModelSettings = () => {
  const editor = useEditor()
  const frame = useActiveObject<fabric.GenerationFrame | undefined>()

  const [model, setModel] = useFrameModel(editor, frame)

  const handleChange = useCallback(
    (params: OnChangeParams) => {
      const model = params.value[0].id
      if (model) {
        setModel(model as ModelTypes)
      }
    },
    [setModel]
  )

  const options: { label: string; id: ModelTypes }[] = [
    { label: "Stable Diffusion", id: "stable-diffusion" },
    { label: "Stable Diffusion Inpainting", id: "stable-diffusion-inpainting" },
    { label: "OpenJourney", id: "openjourney" },
  ]

  return (
    <Select
      backspaceRemoves={false}
      clearable={false}
      deleteRemoves={false}
      options={options}
      value={[{ id: model }]}
      searchable={false}
      placeholder="Select color"
      onChange={handleChange}
      overrides={{
        ValueContainer: {
          style: () => ({
            backgroundColor: "white",
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
          }),
        },
        ControlContainer: {
          style: () => ({
            borderTopWidth: 0,
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: 0,
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
