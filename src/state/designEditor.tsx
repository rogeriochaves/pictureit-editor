import { Editor } from "@layerhub-io/core"
import { IScene } from "@layerhub-io/types"
import { atom, RecoilState } from "recoil"
import { ContextMenuTimelineRequest, DesignType, IDesign } from "~/interfaces/DesignEditor"

// This is synced with the value from useEditor to ease usage inside recoil functions
export const recoilEditorState: RecoilState<Editor | null> = atom({
  key: "recoilEditorState",
  default: null as Editor | null,
  dangerouslyAllowMutability: true,
})

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

export const displayPlaybackState: RecoilState<boolean | undefined> = atom({
  key: "displayPlaybackState",
  default: undefined as boolean | undefined,
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
  default: "#E24625",
})

export const publishTitleState: RecoilState<string | undefined> = atom({
  key: "publishTitleState",
  default: undefined as string | undefined,
})

export const drawingBrushSizeState: RecoilState<number> = atom({
  key: "drawingBrushSizeState",
  default: 15,
})

export const eraserBrushSizeState: RecoilState<number> = atom({
  key: "eraserBrushSizeState",
  default: 60,
})
