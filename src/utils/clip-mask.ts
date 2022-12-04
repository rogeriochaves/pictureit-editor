export const paintItBlack = (ctx: CanvasRenderingContext2D) => {
  const w = ctx.canvas.width,
    h = ctx.canvas.height,
    iData = ctx.getImageData(0, 0, w, h),
    buffer = iData.data,
    len = buffer.length

  for (let i = 0; i < len; i += 4) {
    if (buffer[i + 3] == 255) {
      buffer[i] = 0
      buffer[i + 1] = 0
      buffer[i + 2] = 0
    } else {
      buffer[i] = 255
      buffer[i + 1] = 255
      buffer[i + 2] = 255
      buffer[i + 3] = 255
    }
  }

  ctx.putImageData(iData, 0, 0)
}
