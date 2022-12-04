import { atom, RecoilState } from "recoil"

export const isMobileState: RecoilState<boolean | undefined> = atom({
  key: "isMobileState",
  default: undefined as boolean | undefined,
})

export enum ToolType {
  MOVE = "Move",
  GENERATION = "Generation",
  DRAWING = "Drawing",
}

export const activeToolState: RecoilState<ToolType> = atom({
  key: "activeToolState",
  default: ToolType.MOVE as ToolType,
})
