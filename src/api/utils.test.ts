import { describe, expect, it } from "vitest"
import { parseProgressFromLogs } from "./utils"

describe("utils", () => {
  it("returns undefined for gibberish logs", () => {
    const logs = "gibberish"
    expect(parseProgressFromLogs(logs)).toBe(undefined)
  })

  it("parses logs for progress percentage", () => {
    const logs =
      "Using seed: 34149\n  0%|          | 0/50 [00:00<?, ?it/s]\n  4%|▍         | 2/50 [00:00<00:03, 13.52it/s]\n  8%|▊         | 4/50 [00:00<00:03, 13.99it/s]\n 12%|█▏        | 6/50 [00:00<00:03, 14.01it/s]"
    expect(parseProgressFromLogs(logs)).toEqual({
      progress: 12,
    })
  })

  it("parses logs for progress steps", () => {
    const logs =
      "Using seed: 14899\nGenerating initial latents for 9 steps\nGenerating first and last keyframes\nGenerating frame 0 of keyframe 0\nGenerating frame 1 of keyframe 0\nGenerating frame 2 of keyframe 0\nInterpolating images with FILM\nSaving MP4"
    expect(parseProgressFromLogs(logs)).toEqual({
      step: 2,
    })
  })
})
