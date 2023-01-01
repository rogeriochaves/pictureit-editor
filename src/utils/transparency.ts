export const hasAnyTransparentPixel = (ctx: CanvasRenderingContext2D) => {
  const w = ctx.canvas.width,
    h = ctx.canvas.height,
    iData = ctx.getImageData(0, 0, w, h),
    buffer = iData.data,
    len = buffer.length

  for (let i = 0; i < len; i += 4) {
    if (buffer[i + 3] == 0) {
      return true;
    }
  }

  return false;
}
