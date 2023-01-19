import { selector } from "recoil"
import { PictureIt } from "../api/pictureit"

export const currentUserQuery = selector({
  key: "currentUserQuery",
  get: async () => {
    if (PictureIt.isAvailable()) {
      return await PictureIt.user()
    }
  },
})
