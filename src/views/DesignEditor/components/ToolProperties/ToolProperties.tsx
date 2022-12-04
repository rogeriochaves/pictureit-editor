import React, { useState } from "react"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import getSelectionType from "~/utils/get-selection-type"
import { styled } from "baseui"
import Items, { ToolItems } from "./Items"
import { ILayer } from "@layerhub-io/types"
import { activeToolState } from "../../../../state/designEditor"
import { useRecoilValue } from "recoil"

const DEFAULT_TOOLBOX = "Canvas"

interface ToolboxState {
  toolbox: string
}

const Container = styled("div", (props) => ({
  boxShadow: "rgb(0 0 0 / 15%) 0px 1px 1px",
  height: "50px",
  display: "flex",
  borderBottom: "1px solid #e7e8f3",
}))

const Toolbox = () => {
  const [state, setState] = useState<ToolboxState>({ toolbox: DEFAULT_TOOLBOX })
  const activeTool = useRecoilValue(activeToolState)
  const activeObject = useActiveObject() as ILayer
  const editor = useEditor()

  React.useEffect(() => {
    const selectionType = getSelectionType(activeObject)
    if (selectionType) {
      if (selectionType.length > 1) {
        setState({ toolbox: "Multiple" })
      } else {
        setState({ toolbox: selectionType[0] })
      }
    } else {
      setState({ toolbox: DEFAULT_TOOLBOX })
    }
  }, [activeObject])

  React.useEffect(() => {
    const watcher = async () => {
      if (activeObject) {
        // @ts-ignore
        const selectionType = getSelectionType(activeObject) as any

        if (selectionType.length > 1) {
          setState({ toolbox: "Multiple" })
        } else {
          setState({ toolbox: selectionType[0] })
        }
      }
    }
    if (editor) {
      editor.on("history:changed", watcher)
    }
    return () => {
      if (editor) {
        editor.off("history:changed", watcher)
      }
    }
  }, [editor, activeObject])

  // @ts-ignore
  const Component = ToolItems[activeTool] || Items[state.toolbox]

  return <Container>{Component ? <Component /> : state.toolbox}</Container>
}

export default Toolbox
