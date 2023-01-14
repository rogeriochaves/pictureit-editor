import { base64ImageToBinary } from "@layerhub-io/core/src/utils/parser"
import "ffmpeg.js"

export const buildVideo = (b64images: string[]) => {
  return new Promise<string>((resolve, reject) => {
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
        type: "video/mp4",
      })
      const videoUrl = webkitURL.createObjectURL(blob)

      resolve(videoUrl)
    }

    const worker = new Worker(new URL("../../node_modules/ffmpeg.js/ffmpeg-worker-mp4.js", import.meta.url))

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
      // arguments: 'ffmpeg -framerate 24 -pattern_type glob -i *.jpeg -c:v libx264 -pix_fmt yuv420p output.mp4'.split(' '),
      arguments: [
        "-r",
        "20",
        "-i",
        "img%03d.jpeg",
        "-c:v",
        "libx264",
        "-crf",
        "1",
        // "-vf",
        // "scale=150:150",
        "-pix_fmt",
        "yuv420p",
        "-vb",
        "20M",
        "out.mp4",
      ],
      //arguments: '-r 60 -i img%03d.jpeg -c:v libx264 -crf 1 -vf -pix_fmt yuv420p -vb 20M out.mp4'.split(' '),
      MEMFS: images,
    })
  })
}
