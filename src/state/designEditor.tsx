import { IScene } from "@layerhub-io/types"
import { atom, atomFamily, RecoilState } from "recoil"
import { ContextMenuTimelineRequest, DesignType, IDesign } from "~/interfaces/DesignEditor"

export const scenesState: RecoilState<IScene[]> = atom({
  key: "scenesState",
  default: [] as IScene[],
})

export const currentSceneState: RecoilState<IScene | null> = atom({
  key: "currentSceneState",
  default: null as IScene | null,
})

export const currentDesignState: RecoilState<IDesign> = atom({
  key: "currentDesignState",
  default: {
    id: "",
    frame: {
      width: 1,
      height: 1,
    },
    metadata: {},
    name: "New Artwork",
    preview: "",
    scenes: [],
    type: "",
  } as IDesign,
})

export enum ToolType {
  MOVE = "Move",
  GENERATION = "Generation",
  DRAWING = "Drawing",
  ERASER = "Eraser",
}

export const activeToolState: RecoilState<ToolType> = atom({
  key: "activeToolState",
  default: ToolType.MOVE as ToolType,
})

export enum PanelType {
  LAYERS = "Layers",
}

export const activePanelState: RecoilState<PanelType | undefined> = atom({
  key: "activePanelState",
  default: undefined as PanelType | undefined,
})

export const isMobileState: RecoilState<boolean | undefined> = atom({
  key: "isMobileState",
  default: undefined as boolean | undefined,
})

export const editorTypeState: RecoilState<DesignType> = atom({
  key: "editorTypeState",
  default: "GRAPHIC" as DesignType,
})

export const displayPlaybackState: RecoilState<boolean> = atom({
  key: "displayPlaybackState",
  default: false,
})

export const displayPreviewState: RecoilState<boolean> = atom({
  key: "displayPreviewState",
  default: false,
})

export const currentPreviewState: RecoilState<string> = atom({
  key: "currentPreviewState",
  default: "",
})

export const maxTimeState: RecoilState<number> = atom({
  key: "maxTimeState",
  default: 5000,
})

export const contextMenuTimelineRequestState: RecoilState<ContextMenuTimelineRequest> = atom({
  key: "contextMenuTimelineRequestState",
  default: {
    id: "",
    left: 0,
    top: 0,
    visible: false,
  } as ContextMenuTimelineRequest,
})

export const drawingColorState: RecoilState<string> = atom({
  key: "drawingColorState",
  default: "#000",
})

export const publishTitleState: RecoilState<string | undefined> = atom({
  key: "publishTitleState",
  default: undefined as string | undefined,
})