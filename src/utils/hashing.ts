export const sha256Hash = async (message: string) =>
  Array.prototype.map
    .call(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message))), (x) =>
      ("0" + x.toString(16)).slice(-2)
    )
    .join("")
