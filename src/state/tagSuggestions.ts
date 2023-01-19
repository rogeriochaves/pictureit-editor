import { selectorFamily } from "recoil"
import { PictureIt } from "../api/pictureit"

export const tagSuggestionsCall = selectorFamily({
  key: "tagSuggestionsCall",
  get: (prompt: string) => async () => {
    if (PictureIt.isAvailable()) {
      return await PictureIt.tagSuggestions(prompt)
    }
  },
})
