import { fabric } from "fabric"
import { StaticImageObject } from "./StaticImage"
import { StaticTextObject } from "./StaticText"

// @ts-ignore
export class GenerationFrameObject extends fabric.Group {
  static type = "GenerationFrame"
  id: string

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

  async setImage(src: string) {
    return new Promise<void>((resolve, _reject) => {
      fabric.util.loadImage(
        src,
        (img) => {
          const currentImage = this._objects.find(item => (item as any).id == `${this.id}-image`)
          if (currentImage) {
            this.removeWithUpdate(currentImage)
          }

          if (!img) {
            const errorText = new fabric.StaticText({
              //@ts-ignore
              id: `${this.id}-image`,
              type: StaticTextObject.type,
              top: this.top + this.height / 2,
              left: this.left,
              width: this.width,
              text: "Error loading image",
              fontFamily: "sans-serif",
              fontSize: 18,
              editable: false,
              textAlign: "center",
              originY: "center"
            })
            this.addWithUpdate(errorText as any)

            resolve()
            return
          }

          const staticImage = new fabric.StaticImage(img, {
            src,
            id: `${this.id}-image`,
            type: StaticImageObject.type,
            top: this.top,
            left: this.left,
            width: this.width,
            height: this.height,
          })

          this.addWithUpdate(staticImage as any)

          resolve()
        },
        null,
        "anonymous"
      )
    })
  }

  toObject(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude)
  }
  toJSON(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude)
  }

  static fromObject(objects: fabric.Object[], options: GenerationFrameOptions, callback: (arg: fabric.GenerationFrame) => void) {
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
      constructor(objects?: fabric.Object[], options?: GenerationFrameOptions)
    }
  }
}
