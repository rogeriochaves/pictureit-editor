import { fabric } from "fabric"
// @ts-ignore
export class GenerationFrameObject extends fabric.Group {
  static type = "GenerationFrame"
  //@ts-ignore
  initialize(objects?: fabric.Object[], options?: GenerationFrameOptions) {
    const id = options.id

    const groupObjects =
      objects.length > 0
        ? objects
        : [
            new fabric.Rect({
              ...options,
              //@ts-ignore
              id: `${id}-rect`,
              type: "rect",
              selectable: true,
              hasControls: true,
              hasBorders: true,
              absolutePositioned: true,
            }),
          ]

    //@ts-ignore
    super.initialize(groupObjects, {
      //@ts-ignore
      id,
      type: GenerationFrameObject.type,
    })
    return this
  }

  toObject(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude)
  }
  toJSON(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude)
  }

  static fromObject(objects: fabric.Object[], options: GenerationFrameOptions, callback: Function) {
    return callback && callback(new fabric.GenerationFrame(objects, options))
  }
}

fabric.GenerationFrame = fabric.util.createClass(GenerationFrameObject, {
  type: GenerationFrameObject.type,
})
fabric.GenerationFrame.fromObject = GenerationFrameObject.fromObject

export interface GenerationFrameOptions extends fabric.IGroupOptions {
  id: string
}

declare module "fabric" {
  namespace fabric {
    class GenerationFrame extends GenerationFrameObject {
      constructor(objects: fabric.Object[], options: GenerationFrameOptions)
    }
  }
}
