import { nanoid } from "nanoid"
import { IFrame } from "@layerhub-io/types"

export const getDefaultTemplate = async (_canvas: fabric.Canvas, { width, height }: IFrame) => {
  return {
    id: nanoid(),
    frame: {
      width,
      height,
    },
    layers: [],
    metadata: {},
  }
}

export const TEXT_EFFECTS = [
  {
    id: 1,
    name: "None",
    preview: "https://i.ibb.co/Wyx2Ftf/none.webp",
  },
  {
    id: 2,
    name: "Shadow",
    preview: "https://i.ibb.co/HBQc95J/shadow.webp",
  },
  {
    id: 3,
    name: "Lift",
    preview: "https://i.ibb.co/M7zpk5f/lift.webp",
  },
  {
    id: 4,
    name: "Hollow",
    preview: "https://i.ibb.co/vhjCd4w/hollow.webp",
  },
  {
    id: 5,
    name: "Splice",
    preview: "https://i.ibb.co/B2JPTfq/splice.webp",
  },
  {
    id: 6,
    name: "Neon",
    preview: "https://i.ibb.co/fHdD2mx/neon.webp",
  },
]
