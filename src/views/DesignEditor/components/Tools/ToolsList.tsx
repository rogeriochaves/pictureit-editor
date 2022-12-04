import { useStyletron, styled } from "baseui"
import useAppContext from "~/hooks/useAppContext"
import Icons from "~/components/Icons"
import { useTranslation } from "react-i18next"
import Scrollable from "~/components/Scrollable"
import { Block } from "baseui/block"
import { useRecoilValue } from "recoil"
import { editorTypeState } from "../../../../state/designEditor"
import { ToolType } from "../../../../state/appContext"

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
  const { activeTool } = useAppContext()
  const { t } = useTranslation("editor")
  const editorType = useRecoilValue(editorTypeState)

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
  const { setActiveTool } = useAppContext()
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
