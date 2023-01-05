import { IScene, ILayer } from "@layerhub-io/types"
import { canvasFromBitmap } from "./canvas-from-bitmap"

export const loadVideoResource = (videoSrc: string): Promise<HTMLVideoElement> => {
  return new Promise(function (resolve, reject) {
    const video = document.createElement("video")
    video.src = videoSrc
    video.crossOrigin = "anonymous"
    video.addEventListener("loadedmetadata", function (event) {
      video.currentTime = 1
    })

    video.addEventListener("seeked", function () {
      resolve(video)
    })

    video.addEventListener("error", function (error) {
      reject(error)
    })
  })
}

export const captureFrame = (video: HTMLVideoElement): Promise<string> => {
  return new Promise(function (resolve) {
    const canvas = document.createElement("canvas") as HTMLCanvasElement
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(video.src)

    const data = canvas.toDataURL()

    fetch(data)
      .then((res) => {
        return res.blob()
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        resolve(url)
      })
  })
}

export const captureDuration = (video: HTMLVideoElement) => {
  return new Promise((resolve) => {
    resolve(video.duration)
  })
}

export const loadVideoEditorAssets = async (payload: IScene) => {
  const layers: Partial<ILayer>[] = []
  for (const layer of payload.layers) {
    if (layer.type === "StaticVideo") {
      // @ts-ignore
      const video = await loadVideoResource(layer.src)
      const frame = (await captureFrame(video)) as string
      const duration = await captureDuration(video)
      layers.push({
        ...layer,
        preview: frame,
      })
    } else {
      layers.push(layer)
    }
  }
  return {
    ...payload,
    layers: layers,
  }
}

export const captureAllFrames = (videoUrl: string) : Promise<HTMLCanvasElement[]> => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const frames: ImageBitmap[] = []

    async function getVideoElement() {
      const video = document.createElement("video")
      video.crossOrigin = "anonymous"
      video.src = videoUrl
      document.body.append(video)
      await video.play()
      return video
    }

    if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
      const video = await getVideoElement()
      const drawingLoop: VideoFrameRequestCallback = async (_timestamp, _frame) => {
        const bitmap = await createImageBitmap(video)
        frames.push(bitmap)

        if (!video.ended) {
          video.requestVideoFrameCallback(drawingLoop)
        }
      }
      // the last call to rVFC may happen before .ended is set but never resolve
      video.onended = () => resolve(frames.map(canvasFromBitmap))
      video.requestVideoFrameCallback(drawingLoop)
    } else {
      reject("your browser doesn't support this API yet")
    }
  });
}
