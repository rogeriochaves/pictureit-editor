import { fabric } from "fabric"
// @ts-ignore
export class GenerationFrameObject extends fabric.Rect {
  static type = "GenerationFrame"
  initialize(options: GenerationFrameOptions) {
    super.initialize({
      ...options,
      selectable: true,
      hasControls: false,
      hasBorders: true,
    })
    return this
  }

  toObject(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude)
  }
  toJSON(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude)
  }

  static fromObject(options: GenerationFrameOptions, callback: Function) {
    return callback && callback(new fabric.GenerationFrame(options))
  }
}

fabric.GenerationFrame = fabric.util.createClass(GenerationFrameObject, {
  type: GenerationFrameObject.type,
})
fabric.GenerationFrame.fromObject = GenerationFrameObject.fromObject

export interface GenerationFrameOptions extends fabric.IRectOptions {
  id: string
}

declare module "fabric" {
  namespace fabric {
    class GenerationFrame extends GenerationFrameObject {
      constructor(options: GenerationFrameOptions)
    }
  }
}
