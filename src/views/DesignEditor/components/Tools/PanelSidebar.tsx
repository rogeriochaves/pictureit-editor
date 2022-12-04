import { Block } from "baseui/block"
import { useRecoilValue } from "recoil"
import { activePanelState } from "../../../../state/designEditor"
import panels from "../Panels"

const PanelSidebar = () => {
  const activePanel = useRecoilValue(activePanelState)

  const Panel = activePanel && panels[activePanel]

  return (
    <Block
      id="EditorToolItem"
      $style={{
        background: "#ffffff",
        width: Panel ? "306px" : 0,
        flex: "none",
        borderRight: "1px solid #d7d8e3",
        display: "flex",
        transition: "ease width 0.1s",
        overflow: "hidden",
      }}
    >
      {Panel && <Panel />}
    </Block>
  )
}

export default PanelSidebar
