import { useActiveObject, useEditor } from "@layerhub-io/react"
import { Block } from "baseui/block"
import { fabric } from "fabric"
import { useSetRecoilState } from "recoil"
import { hasCapability } from "../../../../../api"
import { ModelCapability } from "../../../../../api/types"
import { hidePopupState } from "../../../../../state/generateImage"
import Common from "./Common"
import { AnimationSettings } from "./GenerationFrame/AnimationSettings"
import { InitImageSettings } from "./GenerationFrame/InitImageSettings"
import { ModelSettings, useFrameModel } from "./GenerationFrame/ModelSettings"
import { StepsSettings } from "./GenerationFrame/StepsSettings"
import { Separator } from "./Shared/Separator"

const GenerationFrame = () => {
  const activeObject = useActiveObject<fabric.GenerationFrame | undefined>()
  const setHidePopup = useSetRecoilState(hidePopupState)
  const editor = useEditor()
  const [model] = useFrameModel(editor, activeObject)

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
        {hasCapability(model, ModelCapability.INIT_IMAGE) && (
          <>
            <Separator />
            <InitImageSettings />
          </>
        )}
        {hasCapability(model, ModelCapability.ANIMATION_FRAMES) && (
          <>
            <Separator />
            <AnimationSettings />
          </>
        )}
        <Separator />
        <StepsSettings />
        <Separator />
      </Block>
      <Common />
    </Block>
  )
}

export default GenerationFrame
