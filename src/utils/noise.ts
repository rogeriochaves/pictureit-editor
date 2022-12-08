// https://stackoverflow.com/a/49434653/996404
const randnBM = (u = 0, v = 0): number => {
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  num = num / 10.0 + 0.5
  if (num > 1 || num < 0) return randnBM()
  return num
}

export const addGaussianNoise = (ctx: CanvasRenderingContext2D, noise = 2) => {
  if (noise <= 0) return

  const w = ctx.canvas.width,
    h = ctx.canvas.height,
    iData = ctx.getImageData(0, 0, w, h),
    buffer = iData.data,
    len = buffer.length

  for (let i = 0; i < len; i += 4) {
    let rand = (randnBM() * 508 - 254) * noise
    let rand2 = (randnBM() * 508 - 254) * noise
    let rand3 = (randnBM() * 508 - 254) * noise

    if (buffer[i + 3] == 0) {
      rand += 254
      rand2 += 254
      rand3 += 254
    }

    buffer[i] += rand
    buffer[i + 1] += rand2
    buffer[i + 2] += rand3
    buffer[i + 3] = 255
  }

  ctx.putImageData(iData, 0, 0)
}
