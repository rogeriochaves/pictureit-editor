import { GenerationProgressEvent } from "."

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

export const parseProgressFromLogs = (logs: string): GenerationProgressEvent | undefined => {
  const percentMatch = Array.of(...logs.matchAll(/([0-9]+%)/g))
  if (percentMatch.length > 0) {
    return { progress: parseInt(percentMatch[percentMatch.length - 1][1], 10) }
  }
  const frameMatch = Array.of(...logs.matchAll(/ frame ([0-9]+)/g))
  if (frameMatch.length > 0) {
    return { step: parseInt(frameMatch[frameMatch.length - 1][1], 10) }
  }
  return undefined
}
