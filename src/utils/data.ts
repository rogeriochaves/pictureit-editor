export const toBase64 = (file: File | Blob) =>
  new Promise<string | undefined>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result?.toString())
    reader.onerror = (error) => reject(error)
  })

export const downloadBlob = (filename: string, blob: Blob) => {
  const a = document.createElement("a")
  document.body.appendChild(a)
  const url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => {
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }, 0)
}

export const b64FileExtension = (b64string: string) => {
  const [meta, _] = b64string.split(";")
  const [__, extension] = meta.split("/")

  return extension
}
