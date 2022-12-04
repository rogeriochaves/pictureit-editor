import { RemoteData } from "~/interfaces/common"
import { createReducer } from "@reduxjs/toolkit"
import { setGenerationRequest } from "./actions"

interface GenerationState {
  requests: { [key: string]: RemoteData<{ image: string }> }
}

const initialState: GenerationState = {
  requests: {}
}

export const generationReducer = createReducer(initialState, (builder) => {
  builder.addCase(setGenerationRequest, (state, { payload }) => {
    state.requests[payload.id] = payload.state
  })
})
