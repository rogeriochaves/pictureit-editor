import {
  Api,
  StableDiffusionInpaintingInput,
  StableDiffusionInpaintingOutput,
  StableDiffusionInput,
  StableDiffusionAdvanceStepsInput,
  StableDiffusionAdvanceStepsOutput,
  StableDiffusionOutput,
} from "../index"
import { proxyFetch } from "../proxyFetch"

const replicateFetch = proxyFetch("https://api.replicate.com")

const Replicate: Api = class {
  static async stableDiffusion(params: StableDiffusionInput): Promise<StableDiffusionOutput> {
    // https://replicate.com/stability-ai/stable-diffusion
    return callReplicate("a9758cbfbd5f3c2094457d996681af52552901775aa2d6dd0b17fd15df959bef", params)
  }

  static async stableDiffusionInpainting(
    params: StableDiffusionInpaintingInput
  ): Promise<StableDiffusionInpaintingOutput> {
    // https://replicate.com/andreasjansson/stable-diffusion-inpainting
    return callReplicate("8eb2da8345bee796efcd925573f077e36ed5fb4ea3ba240ef70c23cf33f0d848", params)
  }

  static async stableDiffusionAdvanceSteps(
    params: StableDiffusionAdvanceStepsInput
  ): Promise<StableDiffusionAdvanceStepsOutput> {
    // https://replicate.com/devxpy/glid-3-xl-stable
    return callReplicate("7d6a340e1815acf2b3b2ee0fcaf830fbbcd8697e9712ca63d81930c60484d2d7", params)
  }
}

async function callReplicate(modelId: string, params: object) {
  if (!import.meta.env.VITE_ENV_REPLICATE_TOKEN) {
    console.error(
      "VITE_ENV_REPLICATE_TOKEN env var is not set, calls to the backend will fail, read more about it on the README of the project"
    )
  }
  const response = await replicateFetch("/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${import.meta.env.VITE_ENV_REPLICATE_TOKEN}`,
    },
    body: JSON.stringify({
      version: modelId,
      input: params,
    }),
  })
  const predictionRequest = await response.json()
  if (predictionRequest.error) {
    throw predictionRequest
  }

  await sleep(4500)
  const result = await checkUntilDone(predictionRequest)

  return result
}

async function checkUntilDone(predictionRequest: { urls: { get: string } }): Promise<{ url: string }> {
  const {
    urls: { get: getUrl },
  } = predictionRequest

  const response = await replicateFetch(getUrl.replace("https://api.replicate.com", ""), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${import.meta.env.VITE_ENV_REPLICATE_TOKEN}`,
    },
  })
  const json = await response.json()
  if (json.status == "succeeded") {
    return { url: json.output[0] as string }
  } else if (json.status == "processing" || json.status == "starting") {
    await sleep(500)
    return checkUntilDone(predictionRequest)
  } else {
    throw json.error
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default Replicate
