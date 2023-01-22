import { toBase64 } from "../../utils/data"
import { proxyFetch } from "../proxyFetch"
import { GenerationModel, ModelCapability } from "../types"

const evokeSdAdd = proxyFetch("https://xarrreg662.execute-api.us-east-1.amazonaws.com")

const evokeSdCheck = proxyFetch("https://qrlh34e4y6.execute-api.us-east-1.amazonaws.com")

const evokeModel = {
  enabled: !!import.meta.env.VITE_ENV_EVOKE_TOKEN,
  setupInstructions: "Set VITE_ENV_EVOKE_TOKEN to enable this model",
}

const evokeStableDiffusion: GenerationModel<
  [ModelCapability.BASIC, ModelCapability.GUIDANCE_SCALE, ModelCapability.NEGATIVE_PROMPT]
> = {
  ...evokeModel,
  name: "[Evoke] Stable Diffusion",
  call: ({ prompt, num_inference_steps, guidance_scale, negative_prompt }) => {
    return callEvoke({
      prompt,
      num_inference_steps,
      guidance_scale,
      negative_prompt,
    })
  },
  capabilities: [ModelCapability.BASIC, ModelCapability.GUIDANCE_SCALE, ModelCapability.NEGATIVE_PROMPT],
  estimatedGenerationTime: 7_000
}

export const models = {
  evokeStableDiffusion,
}

async function callEvoke(params: object) {
  if (!import.meta.env.VITE_ENV_REPLICATE_TOKEN) {
    console.error(
      "VITE_ENV_REPLICATE_TOKEN env var is not set, calls to the backend will fail, read more about it on the README of the project"
    )
  }
  const response = await evokeSdAdd("/sdAddEle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: import.meta.env.VITE_ENV_EVOKE_TOKEN,
      ...params,
    }),
  })
  const predictionRequest = await response.json()
  if (predictionRequest.error) {
    throw predictionRequest
  }

  const result = await checkUntilDone(predictionRequest)

  return result
}

async function checkUntilDone(predictionRequest: { body: { UUID: string } }): Promise<{ url: string }> {
  const {
    body: { UUID },
  } = predictionRequest

  const response = await evokeSdCheck("/sdCheckEle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: import.meta.env.VITE_ENV_EVOKE_TOKEN,
      UUID,
    }),
  })
  const json = await response.json()

  // Evoke returns an Amazon S3 url that may or may not be available yet
  if (json.body) {
    const origin = new URL(json.body).origin
    const proxyS3Fetch = proxyFetch(origin)

    try {
      const response = await proxyS3Fetch(json.body.replace(origin, ""), { method: "GET" })
      const image = await toBase64(await response.blob())

      if (image) {
        return { url: image }
      } else {
        throw "Error parsing image"
      }
    } catch (err) {
      if ((err as Response).status === 404) {
        await sleep(250)
        return checkUntilDone(predictionRequest)
      } else {
        throw err
      }
    }
  } else {
    throw "Something went wrong"
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
