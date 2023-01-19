import { PictureIt, PICTURE_IT_URL } from "../api/pictureit";
import { lazySelector } from "../utils/lazySelectorFamily"

export const publishPictureCall = lazySelector({
  key: "publishPictureCall",
  get:
    () =>
    async ({ title, image, video, videoLoop }: { title: string; image: string, video?: string, videoLoop?: boolean }) => {
      if (PictureIt.isAvailable()) {
        const result = await PictureIt.publish(title, image, video, videoLoop)

        window.open(PICTURE_IT_URL + result.url, "_blank")?.focus()
      }
    },
})
