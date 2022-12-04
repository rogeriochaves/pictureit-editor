export const canvasFromImage = async (src: string, width: number, height: number): Promise<HTMLCanvasElement> =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject("timeout"), 5000)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!

    const image = new Image()
    image.onload = function () {
      ctx.drawImage(image, 0, 0)

      clearTimeout(timeout)
      resolve(canvas)
    }
    image.src = src
  })
