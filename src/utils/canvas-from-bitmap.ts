export const canvasFromBitmap = (imageBitmap: ImageBitmap): HTMLCanvasElement => {
  const canvas = document.createElement("canvas")
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  const ctx = canvas.getContext("2d")!

  ctx.drawImage(imageBitmap, 0, 0)
  return canvas
}
