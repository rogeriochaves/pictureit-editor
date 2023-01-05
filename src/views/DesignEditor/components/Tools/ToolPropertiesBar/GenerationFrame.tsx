import { useActiveObject, useEditor } from "@layerhub-io/react"
import { Block } from "baseui/block"
import { fabric } from "fabric"
import Common from "./Common"
import { InitImageSettings } from "./GenerationFrame/InitImageSettings"
import { StepsSettings } from "./GenerationFrame/StepsSettings"
import { Separator } from "./Shared/Separator"
import { useSetRecoilState } from "recoil"
import { hidePopupState } from "../../../../../state/generateImage"
import { ModelSettings } from "./GenerationFrame/ModelSettings"
import { Button } from "baseui/button"
import { captureAllFrames } from "../../../../../utils/video"
import { useCallback } from "react"
import { useAddScene } from "../../Footer/Graphic/Scenes"

const GenerationFrame = () => {
  const activeObject = useActiveObject<fabric.GenerationFrame | undefined>()
  const setHidePopup = useSetRecoilState(hidePopupState)

  const editor = useEditor()!
  const addScene = useAddScene()
  const onRenderVideo = useCallback(async () => {
    if (!activeObject) return

    const frames = await captureAllFrames(
      "https://replicate.delivery/pbxt/9GdlTkwrtzppJ9xjDEsKsP9JUN8rs1sP0xKfLqtXVpa53WIIA/output.mp4"
    )
    const images = frames.map((frame) => frame.toDataURL("image/webp", 0.6))
    if (images[0]) {
      await activeObject.setImage(images[0])
      editor.canvas.canvas.requestRenderAll()
    }
    addScene(false, images.slice(1))
  }, [activeObject, addScene, editor.canvas.canvas])

  if (!activeObject) return null

  return (
    <Block
      onClick={() => {
        setHidePopup(true)
      }}
      $style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        justifyContent: "space-between",
      }}
    >
      <Block display="flex" gridGap="0.5rem" alignItems="center">
        <ModelSettings />
        <Separator />
        <InitImageSettings />
        <Separator />
        <StepsSettings />
        <Separator />
        <Button onClick={onRenderVideo}>Render Video</Button>
      </Block>
      <Common />
    </Block>
  )
}

export default GenerationFrame
