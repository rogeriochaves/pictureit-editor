export const extractErrorMessage = async (error: any) => {
  if (error.json) {
    try {
      const json = await error.json()
      if (json.error) {
        return json.error
      }
    } catch (_e) {}
  }
  if (error.status && (error.status < 200 || error.status >= 300)) {
    return `${error.status} ${error.statusText}`
  }

  return error.toString()
}
