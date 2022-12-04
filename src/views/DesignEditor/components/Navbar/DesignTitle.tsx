import { Block } from "baseui/block"
import CloudCheck from "~/components/Icons/CloudCheck"
import { StatefulTooltip } from "baseui/tooltip"
import { useRecoilState } from "recoil"
import { currentDesignState } from "../../../../state/designEditor"

const DesignTitle = () => {
  const [currentDesign, setCurrentDesign] = useRecoilState(currentDesignState)

  const handleInputChange = (name: string) => {
    setCurrentDesign({ ...currentDesign, name })
  }

  return (
    <Block
      $style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        opacity: 1,
      }}
    >
      <Block display="flex">
        <div style={{ position: "relative", color: "transparent", maxWidth: "200px", whiteSpace: "nowrap" }}>
          <input
            style={{
              position: "absolute",
              width: "100%",
              fontSize: "16px",
              fontFamily: "Uber Move Text",
              background: "none",
              padding: "0",
              color: "#FFF",
              border: "none",
              outline: "none",
            }}
            value={currentDesign.name}
            onChange={(e: any) => handleInputChange(e.target.value)}
          />
          {currentDesign.name}
        </div>
      </Block>

      <StatefulTooltip
        showArrow={true}
        overrides={{
          Inner: {
            style: {
              backgroundColor: "#ffffff",
            },
          },
        }}
        content={() => <Block backgroundColor="#ffffff">All changes are saved</Block>}
      >
        <Block
          $style={{
            cursor: "pointer",
            padding: "10px",
            display: "flex",
            color: "#ffffff",
          }}
        >
          <CloudCheck size={24} />
        </Block>
      </StatefulTooltip>
    </Block>
  )
}

export default DesignTitle
