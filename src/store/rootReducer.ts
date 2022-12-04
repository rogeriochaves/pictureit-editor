import { combineReducers } from "@reduxjs/toolkit"
import { fontsReducer } from "./slices/fonts/reducer"
import { uploadsReducer } from "./slices/uploads/reducer"
import { resourcesReducer } from "./slices/resources/reducer"
import { designEditorReducer } from "./design-editor"

const rootReducer = combineReducers({
  designEditor: designEditorReducer,
  fonts: fontsReducer,
  uploads: uploadsReducer,
  resources: resourcesReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
