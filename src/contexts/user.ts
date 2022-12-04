import { selector } from "recoil"
import api from "../api"

export const currentUserQuery = selector({
  key: "currentUserQuery",
  get: async () => {
    if ("isPictureIt" in api) {
      return api.user()
    }
  },
})
