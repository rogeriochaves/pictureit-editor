import { LayerType } from "@layerhub-io/core"

export default function getSelectionType(selection: any): string[] | null {
  const types = []
  if (!selection) {
    return null
  }
  if (selection.locked) {
    return ["Locked"]
  }

  if (selection.type === LayerType.GENERATION_FRAME) {
    return [selection.type]
  }

  if (selection.type === "group" || selection.type === "activeSelection") {
    return ["Multiple"]
  }

  if (selection._objects) {
    if (selection.type !== "StaticVector") {
      for (const object of selection._objects) {
        types.push(object.type)
      }
    } else {
      types.push(selection.type)
    }
  } else {
    types.push(selection.type)
  }

  return types
}
