import { useTimer } from "@layerhub-io/use-timer"
import { Block } from "baseui/block"
import { useCallback } from "react"
import { useRecoilValue } from "recoil"
import Pause from "~/components/Icons/Pause"
import PlaySolid from "~/components/Icons/PlaySolid"
import useDesignEditorContext from "~/hooks/useDesignEditorContext"
import { maxTimeState, scenesState } from "../../../../../state/designEditor"
import { useSetCurrentScene } from "../Graphic/Scenes"

const useSetSceneForStoppedPosition = () => {
  const scenes = useRecoilValue(scenesState)
  const setCurrentScene = useSetCurrentScene()
  const { time } = useTimer()

  return useCallback(() => {
    let sceneAtTime = scenes[scenes.length - 1]
    let total = 0
    for (const scene of scenes) {
      total = total + (scene.duration || 100)
      if (total >= time) {
        sceneAtTime = scene
        break
      }
    }

    if (sceneAtTime) {
      setCurrentScene(sceneAtTime)
    }
  }, [scenes, setCurrentScene, time])
}

const usePlayPlayback = () => {
  const { time, reset } = useTimer()
  const { setDisplayPlayback } = useDesignEditorContext()
  const maxTime = useRecoilValue(maxTimeState)

  return useCallback(() => {
    if (time >= maxTime) {
      reset()
    }
    setDisplayPlayback(true)
  }, [maxTime, reset, setDisplayPlayback, time])
}

export const usePausePlayback = () => {
  const { pause } = useTimer()
  const { setDisplayPlayback } = useDesignEditorContext()
  const setSceneForStoppedPosition = useSetSceneForStoppedPosition()

  return useCallback(() => {
    pause()
    setSceneForStoppedPosition()
    setTimeout(() => {
      setDisplayPlayback(false)
    }, 100);
  }, [pause, setDisplayPlayback, setSceneForStoppedPosition])
}

const TimelineControl = () => {
  const { status } = useTimer()
  const playPlayback = usePlayPlayback()
  const pausePlayback = usePausePlayback()

  const scenes = useRecoilValue(scenesState)
  const isDisabled = scenes.length < 2
  const paused = status === "STOPPED" || status === "PAUSED"

  return (
    <Block id="EditorPlayControl" $style={{ padding: "0 1rem" }}>
      <button
        onClick={() => {
          if (isDisabled) return
          if (paused) {
            playPlayback()
          } else {
            pausePlayback()
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
          border: "none",
        }}
      >
        {paused ? <PlaySolid size={24} /> : <Pause size={24} />}
      </button>
    </Block>
  )
}

export default TimelineControl
