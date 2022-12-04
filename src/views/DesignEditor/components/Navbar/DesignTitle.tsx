import React from "react"
import { Block } from "baseui/block"
import CloudCheck from "~/components/Icons/CloudCheck"
import { StatefulTooltip } from "baseui/tooltip"
import useDesignEditorContext from "~/hooks/useDesignEditorContext"

interface State {
  name: string
  width: number
}

const DesignTitle = () => {
  const [state, setState] = React.useState<State>({ name: "Untitled Design", width: 0 })
  const { currentDesign, setCurrentDesign } = useDesignEditorContext()

  const handleInputChange = (name: string) => {
    setState({ ...state, name: name })
    setCurrentDesign({ ...currentDesign, name })
  }

  React.useEffect(() => {
    const name = currentDesign.name
    if (name || name === "") {
      setState({ ...state, name: name })
    }
  }, [currentDesign.name])

  React.useEffect(() => {
    setState({ ...state })
  }, [state.name])

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
              outline: "none"
            }}
            value={state.name}
            onChange={(e: any) => handleInputChange(e.target.value)}
          />
          {state.name}
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
