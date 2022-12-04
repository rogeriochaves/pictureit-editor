import React from "react"
import useAppContext from "~/hooks/useAppContext"
import toolItems from "./toolItems"
import { Block } from "baseui/block"
import { useRecoilValue } from "recoil"
import { isSidebarOpenState } from "../../../../state/designEditor"

interface State {
  tool: string
}
const ToolsList = () => {
  const [state, setState] = React.useState<State>({ tool: "Text" })
  const isSidebarOpen = useRecoilValue(isSidebarOpenState)
  const { activeTool, activeSubMenu } = useAppContext()

  React.useEffect(() => {
    setState({ tool: activeTool })
  }, [activeTool])

  React.useEffect(() => {
    if (activeSubMenu) {
      setState({ tool: activeSubMenu })
    } else {
      setState({ tool: activeTool })
    }
  }, [activeTool, activeSubMenu])

  // @ts-ignore
  const Component = toolItems[state.tool]

  return (
    <Block
      id="EditorToolItem"
      $style={{
        background: "#ffffff",
        width: isSidebarOpen ? "306px" : 0,
        flex: "none",
        borderRight: "1px solid #d7d8e3",
        display: "flex",
        transition: "ease width 0.1s",
        overflow: "hidden",
      }}
    >
      {Component && <Component />}
    </Block>
  )
}

export default ToolsList
