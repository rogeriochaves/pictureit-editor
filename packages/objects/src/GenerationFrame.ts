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

    const clipPath = new fabric.Rect({
      ...options,
      //@ts-ignore
      id: `${id}-clipPath`,
      type: "rect",
      absolutePositioned: true,
    })
    const groupObjects =
      objects.length > 0
        ? objects
        : [
            new fabric.Rect({
              ...options,
              top: -options.height / 2,
              left: -options.width / 2,
              //@ts-ignore
              id: `${id}-rect`,
              type: "rect",
              selectable: false,
              hasControls: false,
              hasBorders: false,
              evented: false,
            }),
          ]

    //@ts-ignore
    super.initialize(groupObjects, {
      //@ts-ignore
      ...options,
      id,
      type: GenerationFrameObject.type,
      layout: "clip-path",
      clipPath: clipPath,
      subTargetCheck: true,
      interactive: true,
    })

    this.on("moving", this.adjustClipPath.bind(this))
    this.on("resizing", this.adjustClipPath.bind(this))
    this.on("scaling", this.adjustClipPath.bind(this))

    return this
  }

  public adjustClipPath() {
    this.clipPath.set({
      top: this.top,
      left: this.left,
      width: this.width * this.scaleX,
      height: this.height * this.scaleY,
    })
  }

  async setImage(src: string) {
    return new Promise<void>((resolve, _reject) => {
      fabric.util.loadImage(src).then((img) => {
        const nonRectObjects = this._objects.filter((item) => (item as any).id != `${this.id}-rect`)
        for (const object of nonRectObjects) {
          this.remove(object)
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
            fontFamily: "Uber Move Text, sans-serif",
            fontSize: 18,
            editable: false,
            textAlign: "center",
            originY: "center",
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
          evented: false
        })

        this.add(staticImage as any)

        resolve()
      })
    })
  }

  getRect() {
    return this._objects.find(
      (object) =>
        //@ts-ignore
        object.id == `${this.id}-rect`
    )!
  }

  toObject(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude)
  }
  toJSON(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude)
  }

  static fromObject(options: GenerationFrameOptions, callback: (arg: fabric.GenerationFrame) => void) {
    fabric.util.enlivenObjects(
      (options as any).objects,
      (enlivenObjects: fabric.Object[]) => {
        callback && callback(new fabric.GenerationFrame(enlivenObjects, options))
      },
      ""
    )
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
