type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type GenerationModel<T extends ModelCapability[]> = {
  name: string
  call: (
    params: Partial<ParamsPerCapability[keyof ParamsPerCapability]> &
      Partial<UnionToIntersection<ParamsPerCapability[keyof Pick<ParamsPerCapability, T[number]>]>>
  ) => Promise<GenerationOutput>
  capabilities: T
  enabled: boolean
  setupInstructions: string
  estimatedGenerationTime?: number
}

export enum ModelCapability {
  BASIC = "basic",
  PROGRESS_REPORTING = "progress_reporting",
  INIT_IMAGE = "init_image",
  NEGATIVE_PROMPT = "negative_prompt",
  ANIMATION_FRAMES = "animation_frames",
  GUIDANCE_SCALE = "guidance_scale",
  ADVANCE = "advance",
  INPAINTING = "inpainting",
}

export type ParamsPerCapability = {
  [ModelCapability.BASIC]: {
    prompt: string
    num_inference_steps: number
  }
  [ModelCapability.PROGRESS_REPORTING]: {
    onLoadProgress: LoadProgressCallback
  }
  [ModelCapability.GUIDANCE_SCALE]: {
    guidance_scale: number
  }
  [ModelCapability.INIT_IMAGE]: {
    init_image: string
    prompt_strength: number
  }
  [ModelCapability.INPAINTING]: {
    mask: string
  }
  [ModelCapability.NEGATIVE_PROMPT]: {
    negative_prompt: string
  }
  [ModelCapability.ADVANCE]: {
    skip_timesteps: number
    seed: number
  }
  [ModelCapability.ANIMATION_FRAMES]: {
    prompt_end: string
    num_animation_frames: number
    num_interpolation_steps: number
    film_interpolation: boolean
    output_format: string
  }
}

export type GenerationProgressEvent = { progress: number, label?: string } | { step: number }
export type LoadProgressCallback = (event: GenerationProgressEvent) => void

export type GenerationOutput = {
  url: string
}
