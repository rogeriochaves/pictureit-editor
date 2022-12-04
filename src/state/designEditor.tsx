import { IScene } from "@layerhub-io/types"
import { atom, RecoilState } from "recoil"
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
    name: "",
    preview: "",
    scenes: [],
    type: "",
  } as IDesign,
})

export const isSidebarOpenState: RecoilState<boolean> = atom({
  key: "isSidebarOpenState",
  default: false,
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

export const contextMenuSceneRequestState: RecoilState<ContextMenuTimelineRequest> = atom({
  key: "contextMenuSceneRequestState",
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