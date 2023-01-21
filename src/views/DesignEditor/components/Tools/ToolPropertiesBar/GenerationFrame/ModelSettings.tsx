import { Editor } from "@layerhub-io/core"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import { OnChangeParams, Select } from "baseui/select"
import { fabric } from "fabric"
import { useCallback, useEffect } from "react"
import { atom, RecoilState, useRecoilState } from "recoil"
import { AnyModel, availableGenerators, getModelByKey, ModelKeys } from "../../../../../../api"
import { renderToDetectModelToUse } from "../../../../../../state/generateImage"

const frameModelState: RecoilState<AnyModel> = atom({
  key: "frameModelState",
  default: availableGenerators[0],
})

// Prevent multiple components from rerendering frame every time just to detect the model to be used
let useEffectRegistered = false

// Wrapps chosen model attached to the frame, or auto-detect one if not set
export const useFrameModel = (
  editor: Editor | null,
  frame: fabric.GenerationFrame | undefined
): [AnyModel, (model: AnyModel) => void] => {
  const [model, setModelPrivate] = useRecoilState(frameModelState)

  useEffect(() => {
    if (!editor || !frame) return
    if (useEffectRegistered) return

    const { modelKey } = frame.metadata || {}
    const model = getModelByKey(modelKey as ModelKeys)

    if (model) {
      setModelPrivate(model)
    } else {
      renderToDetectModelToUse(editor, frame).then((model) => {
        if (model) {
          setModelPrivate(model)
        }
      })
    }

    useEffectRegistered = true
    return () => {
      useEffectRegistered = false
    }
  }, [editor, frame, setModelPrivate])

  const setModel = useCallback(
    (model: AnyModel) => {
      if (!frame) return

      if (model) {
        setModelPrivate(model)
        frame.metadata = {
          ...(frame.metadata || {}),
          modelKey: model.key,
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
      const modelKey = params.value[0].id
      const model = getModelByKey(modelKey as ModelKeys)
      if (model) {
        setModel(model)
      }
    },
    [setModel]
  )

  const options: { label: string; id: ModelKeys }[] = availableGenerators.map((model) => ({
    label: model.name,
    id: model.key,
  }))

  return (
    <Select
      backspaceRemoves={false}
      clearable={false}
      deleteRemoves={false}
      options={options}
      value={[{ id: model.key }]}
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
