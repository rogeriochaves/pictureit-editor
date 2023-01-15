import { base64ImageToBinary } from "@layerhub-io/core/src/utils/parser"

export const buildVideo = (b64images: string[], framesPerSecond: number) => {
  return new Promise<{ blob: Blob, url: string }>((resolve, reject) => {
    const images = b64images.map((b64image, index) => {
      const { data, type } = base64ImageToBinary(b64image)
      const [_, extension] = type.split("/")

      return {
        name: `img${index.toString().padStart(3, "0")}.${extension}`,
        data,
      }
    })

    const done = (result: BlobPart) => {
      const blob = new Blob([result], {
        type: "video/webm",
      })
      const url = webkitURL.createObjectURL(blob)

      resolve({ blob, url })
    }

    const worker = new Worker(new URL("../../node_modules/ffmpeg.js/ffmpeg-worker-webm.js", import.meta.url))

    let log = ""
    worker.onmessage = function (e) {
      const msg = e.data

      switch (msg.type) {
        case "stdout":
          console.log(msg.data)
          break
        case "stderr":
          log += `${msg.data}\n`
          break
        case "exit":
          if (msg.data == 0) {
            console.log(log)
          } else {
            console.error(log)
            reject("Process exited with code " + msg.data)
          }
          break
        case "done":
          if (msg.data.MEMFS[0]) {
            done(msg.data.MEMFS[0].data)
          }
          break
      }
    }

    // https://trac.ffmpeg.org/wiki/Slideshow
    // https://semisignal.com/tag/ffmpeg-js/
    worker.postMessage({
      type: "run",
      TOTAL_MEMORY: 268435456,
      arguments: [
        "-framerate",
        `${framesPerSecond}`,
        "-i",
        "img%03d.jpeg",
        "-crf",
        "20",
        "-vb",
        "20M",
        "out.webm",
      ],
      MEMFS: images,
    })
  })
}
