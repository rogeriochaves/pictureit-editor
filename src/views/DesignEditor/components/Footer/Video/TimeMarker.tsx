import { useTimer } from "@layerhub-io/use-timer"
import { Block } from "baseui/block"
import React from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { displayPlaybackState, maxTimeState, scenesState } from "~/state/designEditor"

const SCALE_FACTOR = 1

const TimeMarker = () => {
  const { time, setTime, pause } = useTimer()

  const [position, setPosition] = React.useState({
    x: 0,
    y: 0,
  })
  const scenes = useRecoilValue(scenesState)
  const [displayPlayback, setDisplayPlayback] = useRecoilState(displayPlaybackState)
  const [maxTime, setMaxTime] = useRecoilState(maxTimeState)
  const isDisabled = scenes.length < 2

  React.useEffect(() => {
    if (time * SCALE_FACTOR <= maxTime) {
      setPosition({ ...position, x: time * SCALE_FACTOR, y: 0 })
    } else {
      setPosition({ ...position, x: maxTime * SCALE_FACTOR, y: 0 })
      pause()
      setDisplayPlayback(false)
    }
  }, [time])

  React.useEffect(() => {
    if (scenes) {
      const maxTime = scenes.reduce(function (previousVal, currentValue) {
        return previousVal + (currentValue.duration || 100)
      }, 0)
      setMaxTime(maxTime)
    }
  }, [scenes])

  const onStart = () => {
    const playHeadDomRef = document.getElementById("EditorPlayHead") as HTMLDivElement
    const initialX = playHeadDomRef.offsetLeft
    const toolsListRef = document.getElementById("EditorToolList") as HTMLDivElement
    const toolItemRef = document.getElementById("EditorToolItem") as HTMLDivElement
    const playControlRef = document.getElementById("EditorPlayControl") as HTMLDivElement

    const toolItemsWidth =
      toolsListRef.getBoundingClientRect().width +
      toolItemRef.getBoundingClientRect().width +
      playControlRef.getBoundingClientRect().width

    const onDrag = (ev: MouseEvent) => {
      let x = ev.clientX - initialX - toolItemsWidth
      let newX = initialX + x * 40
      if (newX + 2 <= 0 || newX >= maxTime) return
      setTime(newX)
    }

    const onStop = () => {
      window.removeEventListener("mousemove", onDrag)
      window.removeEventListener("mouseup", onStop)
    }

    window.addEventListener("mousemove", onDrag)
    window.addEventListener("mouseup", onStop)
  }

  if (displayPlayback === undefined || isDisabled) return null

  return (
    <Block
      onMouseDown={onStart}
      $style={{
        position: "absolute",
        zIndex: 3,
        left: `${position.x}px`,
        top: "-2px",
        width: "2px",
        bottom: "0px",
      }}
    >
      <Block
        id="EditorPlayHead"
        $style={{
          width: 0,
          height: 0,
          borderLeft: "9px solid transparent",
          borderRight: "9px solid transparent",
          borderTop: "11px solid #333333",
          borderRadius: "5px",
          transform: "translate(-8px, -1px)",
        }}
      />

      <Block
        id="markerLine"
        $style={{
          height: "110px",
          width: "2px",
          backgroundColor: "#333333",
          transform: "translate(0, -2px)",
        }}
      />
    </Block>
  )
}

export default TimeMarker
