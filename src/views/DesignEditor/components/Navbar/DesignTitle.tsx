import { Block } from "baseui/block"
import { Alert } from "baseui/icon"
import { StatefulTooltip } from "baseui/tooltip"
import { useRecoilState, useRecoilValue } from "recoil"
import CloudCheck from "~/components/Icons/CloudCheck"
import Refresh from "../../../../components/Icons/Refresh"
import { currentDesignState } from "../../../../state/designEditor"
import { exponentialBackoffSaveRetryState, saveFileCall } from "../../../../state/file"
import { useRecoilValueLazyLoadable } from "../../../../utils/lazySelectorFamily"

const DesignTitle = () => {
  const [currentDesign, setCurrentDesign] = useRecoilState(currentDesignState)
  const saveRequest = useRecoilValueLazyLoadable(saveFileCall)
  const hasSaveStarted = !(saveRequest.state == "hasValue" && saveRequest.contents === undefined)
  const exponentialBackoffSaveRetry = useRecoilValue(exponentialBackoffSaveRetryState)
  const retryMessage = exponentialBackoffSaveRetry
    ? `Failed to save file, retrying in ${exponentialBackoffSaveRetry.backoff / 1000}s`
    : "Failed to save file, please check your internet connection"

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

      {hasSaveStarted && (
        <StatefulTooltip
          showArrow={true}
          overrides={{
            Inner: {
              style: {
                backgroundColor: "#ffffff",
              },
            },
          }}
          content={() => (
            <Block backgroundColor="#ffffff">
              {saveRequest.state == "loading"
                ? "Saving changes..."
                : saveRequest.state == "hasError"
                ? retryMessage
                : "All changes are saved"}
            </Block>
          )}
        >
          <Block
            $style={{
              cursor: "pointer",
              padding: "10px",
              display: "flex",
              color: "#ffffff",
            }}
          >
            {saveRequest.state == "loading" ? (
              <Refresh size={16} />
            ) : saveRequest.state == "hasError" ? (
              <Alert size={24} />
            ) : (
              <CloudCheck size={24} />
            )}
          </Block>
        </StatefulTooltip>
      )}
    </Block>
  )
}

export default DesignTitle
