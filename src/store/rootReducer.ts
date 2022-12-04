import { combineReducers } from "@reduxjs/toolkit"
import { fontsReducer } from "./slices/fonts/reducer"
import { uploadsReducer } from "./slices/uploads/reducer"
import { resourcesReducer } from "./slices/resources/reducer"

const rootReducer = combineReducers({
  fonts: fontsReducer,
  uploads: uploadsReducer,
  resources: resourcesReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
