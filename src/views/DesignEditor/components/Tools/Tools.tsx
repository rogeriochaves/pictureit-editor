import { useStyletron, styled } from "baseui"
import Icons from "~/components/Icons"
import { useTranslation } from "react-i18next"
import Scrollable from "~/components/Scrollable"
import { Block } from "baseui/block"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { activeToolState, ToolType } from "../../../../state/designEditor"

export const TOOL_ITEMS = [
  {
    id: "move",
    name: ToolType.MOVE,
  },
  {
    id: "generation",
    name: ToolType.GENERATION,
  },
  {
    id: "eraser",
    name: ToolType.ERASER,
  },
  {
    id: "drawing",
    name: ToolType.DRAWING,
  },
]

const Container = styled("div", (props) => ({
  width: "80px",
  backgroundColor: props.$theme.colors.primary100,
  display: "flex",
}))

const ToolsList = () => {
  const activeTool = useRecoilValue(activeToolState)
  const { t } = useTranslation("editor")

  return (
    <Container>
      <Scrollable autoHide={true}>
        {TOOL_ITEMS.map((toolListItem) => (
          <ToolListItem
            label={t(`tools.toolsList.${toolListItem.id}`)}
            name={toolListItem.name}
            key={toolListItem.name}
            icon={toolListItem.name}
            activeTool={activeTool}
          />
        ))}
      </Scrollable>
    </Container>
  )
}

const ToolListItem = ({ label, icon, activeTool, name }: any) => {
  const setActiveTool = useSetRecoilState(activeToolState)
  const [_css, theme] = useStyletron()
  // @ts-ignore
  const Icon = Icons[icon]
  return (
    <Block
      id="EditorToolList"
      onClick={() => {
        setActiveTool(name)
      }}
      $style={{
        width: "80px",
        height: "80px",
        backgroundColor: name === activeTool ? theme.colors.white : theme.colors.primary100,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        fontFamily: "Uber Move Text",
        fontWeight: 500,
        fontSize: "0.8rem",
        userSelect: "none",
        transition: "all 0.5s",
        gap: "0.3rem",
        ":hover": {
          cursor: "pointer",
          backgroundColor: theme.colors.white,
          transition: "all 1s",
        },
      }}
    >
      <Icon size={24} />
      <div>{label}</div>
    </Block>
  )
}

export default ToolsList
