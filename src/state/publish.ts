import api from "../api"
import { PICTURE_IT_URL } from "../api/adapters/pictureit"
import { lazySelector } from "../utils/lazySelectorFamily"

export const publishPictureCall = lazySelector({
  key: "publishPictureCall",
  get:
    () =>
    async ({ title, image }: { title: string; image: string }) => {
      if ("isPictureIt" in api) {
        const result = await api.publish(title, image)

        window.open(PICTURE_IT_URL + result.url, "_blank")?.focus()
      }
    },
})
