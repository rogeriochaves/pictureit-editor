import { selectorFamily } from "recoil"
import api from "../api"

export const tagSuggestionsCall = selectorFamily({
  key: "tagSuggestionsCall",
  get: (prompt: string) => async () => {
    if ("isPictureIt" in api) {
      return await api.tagSuggestions(prompt)
    }
  },
})
