import { atom, RecoilState } from "recoil"
import { PanelType } from "../constants/app-options"

export const isMobileState: RecoilState<boolean | undefined> = atom({
  key: "isMobileState",
  default: undefined as boolean | undefined
})

export const activePanelState: RecoilState<PanelType> = atom({
  key: "activePanelState",
  default: PanelType.MOVE as PanelType,
})

export const activeSubMenuState: RecoilState<string | null> = atom({
  key: "activeSubMenuState",
  default: null as string | null,
})
