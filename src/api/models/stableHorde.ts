import { proxyFetch } from "../proxyFetch"
import { GenerationModel, LoadProgressCallback, ModelCapability } from "../types"

const stableHordeProxy = proxyFetch("no-host-needed")

const stableHordeModel = {
  enabled: true,
  setupInstructions: "Set VITE_ENV_STABLE_HORDE_TOKEN for better priority queue on the Stable Horde cluster",
}

const stableHordeStableDiffusion: GenerationModel<
  [
    ModelCapability.BASIC,
    ModelCapability.PROGRESS_REPORTING,
    ModelCapability.GUIDANCE_SCALE,
    ModelCapability.NEGATIVE_PROMPT
  ]
> = {
  ...stableHordeModel,
  name: "[Stable Horde] Stable Diffusion",
  call: ({ onLoadProgress, prompt, num_inference_steps, guidance_scale, negative_prompt }) => {
    return callStableHorde(
      {
        prompt,
        num_inference_steps,
        guidance_scale,
        negative_prompt,
      },
      onLoadProgress
    )
  },
  capabilities: [
    ModelCapability.BASIC,
    ModelCapability.PROGRESS_REPORTING,
    ModelCapability.GUIDANCE_SCALE,
    ModelCapability.NEGATIVE_PROMPT,
  ],
}

export const models = {
  stableHordeStableDiffusion,
}

async function callStableHorde(params: object, onLoadProgress: LoadProgressCallback | undefined) {
  const response = await stableHordeProxy("/stableHorde/postAsyncGenerate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        token: import.meta.env.VITE_ENV_STABLE_HORDE_TOKEN || "0000000000",
        ...params,
      },
    ]),
  })
  const predictionRequest = await response.json()
  if (predictionRequest.error) {
    throw predictionRequest
  }

  const result = await checkUntilDone(predictionRequest, onLoadProgress, undefined)

  return result
}

async function checkUntilDone(
  predictionRequest: { id: string },
  onLoadProgress: LoadProgressCallback | undefined,
  initialQueuePosition: number | undefined
): Promise<{ url: string }> {
  const { id } = predictionRequest

  const response = await stableHordeProxy(
    `/stableHorde/${initialQueuePosition === 0 ? "getGenerationStatus" : "getGenerationCheck"}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([id]),
    }
  )
  const json = await response.json()

  if (json.faulted) {
    throw "An error has occurred trying to generate the image in the cluster"
  } else if (json.done && initialQueuePosition === 0 && json.generations?.length > 0) {
    return { url: json.generations[0].img }
  } else if (json.done) {
    const response = await stableHordeProxy("/stableHorde/getGenerationStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([id]),
    })
    const json = await response.json()

    if (json.generations?.length > 0) {
      return { url: json.generations[0].img }
    } else {
      await sleep(500)
      return checkUntilDone(predictionRequest, onLoadProgress, initialQueuePosition)
    }
  } else {
    const queuePosition: number = json.queue_position
    onLoadProgress?.({
      progress:
        queuePosition === 0
          ? 90
          : initialQueuePosition
          ? Math.min((1 - queuePosition / initialQueuePosition + 0.4) * 100, 90)
          : 40,
      label: `Queue Position #${queuePosition}`,
    })

    await sleep(500)
    return checkUntilDone(
      predictionRequest,
      onLoadProgress,
      queuePosition === 0 ? 0 : initialQueuePosition || queuePosition
    )
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
