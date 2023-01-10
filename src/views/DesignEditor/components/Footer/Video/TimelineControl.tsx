import { useTimer } from "@layerhub-io/use-timer"
import { Block } from "baseui/block"
import { useRecoilValue } from "recoil"
import Pause from "~/components/Icons/Pause"
import PlaySolid from "~/components/Icons/PlaySolid"
import useDesignEditorContext from "~/hooks/useDesignEditorContext"
import { scenesState } from "../../../../../state/designEditor"

const TimelineControl = () => {
  const { status } = useTimer()
  const { setDisplayPlayback } = useDesignEditorContext()

  const scenes = useRecoilValue(scenesState)
  const isDisabled = scenes.length < 2
  const paused = status === "STOPPED" || status === "PAUSED"

  return (
    <Block id="EditorPlayControl" $style={{ padding: "0 1rem" }}>
      <button
        onClick={() => {
          if (isDisabled) return
          if (paused) {
            setDisplayPlayback(true)
          } else {
            setDisplayPlayback(false)
          }
        }}
        disabled={isDisabled}
        title={isDisabled ? "Add more frames to play" : undefined}
        style={{
          height: "56px",
          width: "56px",
          background: "#ffffff",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 1px rgba(64,87,109,0.07),0 2px 12px rgba(53,71,90,0.2)",
          border: "none"
        }}
      >
        {paused ? <PlaySolid size={24} /> : <Pause size={24} />}
      </button>
    </Block>
  )
}

export default TimelineControl
