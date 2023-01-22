import { models as mockedModels } from "./models/mocked"
import { models as pictureItModels } from "./models/pictureit"
import { models as replicateModels } from "./models/replicate"
import { models as evokeModels } from "./models/evoke"
import { PictureIt } from "./pictureit"
import { ModelCapability } from "./types"

const mocksEnabled = !!import.meta.env.VITE_ENV_MOCKED_MODELS

const models = {
  ...(mocksEnabled ? mockedModels : {}),
  ...(PictureIt.isAvailable() ? pictureItModels : { ...replicateModels, ...evokeModels }),
}

export type ModelKeys = keyof typeof models

const modelList = Object.entries(models).map(([key, model]) => ({
  ...model,
  key: key as ModelKeys,
}))

export type AnyModel = typeof modelList[number]

export const availableGenerators = modelList

export const firstModelByCapability = (capability: ModelCapability) =>
  modelList.find((model) => model.capabilities.includes(capability as any))

export const getModelByKey = (key: ModelKeys) => modelList.find((model) => model.key == key)

export const hasCapability = (model: AnyModel, capability: ModelCapability) =>
  model.capabilities.some((c) => c == capability)
