import { combineReducers } from "@reduxjs/toolkit"
import { fontsReducer } from "./slices/fonts/reducer"
import { uploadsReducer } from "./slices/uploads/reducer"
import { resourcesReducer } from "./slices/resources/reducer"
import { generationReducer } from "./generation"
import { designEditorReducer } from "./design-editor"

const rootReducer = combineReducers({
  designEditor: designEditorReducer,
  fonts: fontsReducer,
  uploads: uploadsReducer,
  resources: resourcesReducer,
  generation: generationReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
