export const toBase64 = (file: File | Blob) =>
  new Promise<string | undefined>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result?.toString())
    reader.onerror = (error) => reject(error)
  })