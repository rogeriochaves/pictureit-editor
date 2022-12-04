import { atom, RecoilState } from "recoil"
import { ToolType } from "../constants/app-options"

export const isMobileState: RecoilState<boolean | undefined> = atom({
  key: "isMobileState",
  default: undefined as boolean | undefined
})

export const activeToolState: RecoilState<ToolType> = atom({
  key: "activeToolState",
  default: ToolType.MOVE as ToolType,
})

export const activeSubMenuState: RecoilState<string | null> = atom({
  key: "activeSubMenuState",
  default: null as string | null,
})
