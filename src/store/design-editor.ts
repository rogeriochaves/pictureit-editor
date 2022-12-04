import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit"
import { Page } from "../interfaces/common"

interface DesignEditorState {
  pages: Page[]
  drawingColor: string
}

const initialState: DesignEditorState = {
  pages: [
    {
      id: nanoid(),
      name: "First page",
    },
  ],
  drawingColor: "#000",
}

const slice = createSlice({
  name: "design-editor",
  initialState,
  reducers: {
    addPage: (state, { payload }: PayloadAction<Page>) => {
      state.pages = state.pages.concat(payload)
    },
    removePage: () => {},
    setDrawingColor: (state, { payload }: PayloadAction<string>) => {
      state.drawingColor = payload
    },
  },
})

export const { addPage, removePage, setDrawingColor } = slice.actions
export const designEditorReducer = slice.reducer
