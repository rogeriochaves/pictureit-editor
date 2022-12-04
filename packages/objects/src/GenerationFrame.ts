import { fabric } from "fabric"
import { StaticImageObject } from "./StaticImage"
import { StaticTextObject } from "./StaticText"

// @ts-ignore
export class GenerationFrameObject extends fabric.Group {
  static type = "GenerationFrame"
  id: string
  loadingAnimation: () => void | undefined

  //@ts-ignore
  initialize(objects?: fabric.Object[], options?: GenerationFrameOptions) {
    const id = options.id

    const clipPath = new fabric.Rect({
      top: options.top,
      left: options.left,
      width: options.width,
      height: options.height,
      //@ts-ignore
      id: `${id}-clipPath`,
      type: "rect",
      absolutePositioned: true,
    })

    for (const object of objects) {
      object.evented = false
    }
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
    // for some reason top and left and overwritten misteriously after initialize after fromObject
    this.top = options.top
    this.left = options.left

    this.on("moving", this.adjustClipPath)
    this.on("resizing", this.adjustClipPath)
    this.on("scaling", this.adjustClipPath)
    this.adjustClipPath()
    this.adjustRect()

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

  public adjustRect() {
    this.getRect().set({
      width: this.width / this.scaleX,
      height: this.height / this.scaleY,
    })
  }

  async setImage(src: string) {
    return new Promise<void>((resolve, _reject) => {
      fabric.util.loadImage(src).then((img) => {
        const nonRectObjects = this._objects.filter(
          (item) => (item as any).id != `${this.id}-rect` && (item as any).id != `${this.id}-loading-bar`
        )
        for (const object of nonRectObjects) {
          this.remove(object)
        }
        const loadingBar = this.getLoadingBar()

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
            evented: false,
          })
          this.add(errorText as any)

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
          evented: false,
        })

        this.add(staticImage as any)

        if (loadingBar) {
          if (this.loadingAnimation) {
            // cancels animation
            this.loadingAnimation()
          }
          this.remove(loadingBar)
          this.add(loadingBar)
          loadingBar.width = this.width
          loadingBar.animate("opacity", 0, {
            onChange: this.canvas.requestRenderAll.bind(this.canvas),
            onComplete: () => {
              this.remove(loadingBar)
            },
            duration: 1000,
          })
        }

        resolve()
      })
    })
  }

  showLoading(duration) {
    const loadingBar = new fabric.Rect({
      top: this.top,
      left: this.left,
      //@ts-ignore
      id: `${this.id}-loading-bar`,
      type: "rect",
      selectable: false,
      hasControls: false,
      hasBorders: false,
      evented: false,
      width: 1,
      height: 16,
      fill: "rgba(66, 161, 214, 1)",
    })
    //@ts-ignore
    const grad = new fabric.Gradient({
      type: "linear",
      coords: {
        x1: 0,
        y1: 0,
        x2: this.width,
        y2: 0,
      },
      colorStops: [
        {
          color: "rgba(45, 190, 163, 1)",
          offset: 0,
        },
        {
          color: "rgba(66, 161, 214, 1)",
          offset: 0.5,
        },
        {
          color: "rgba(136, 64, 254, 1)",
          offset: 1,
        },
      ],
    })
    //@ts-ignore
    loadingBar.fill = grad.toLive(this.canvas.getContext())

    this.add(loadingBar)

    this.loadingAnimation = loadingBar.animate("width", this.width * 0.95, {
      onChange: this.canvas.requestRenderAll.bind(this.canvas),
      duration,
      easing: fabric.util.ease.easeInOutQuad,
    }) as any

    this.canvas.requestRenderAll()
  }

  getRect() {
    return this._objects.find(
      (object) =>
        //@ts-ignore
        object.id == `${this.id}-rect`
    )!
  }

  getLoadingBar() {
    return this._objects.find(
      (object) =>
        //@ts-ignore
        object.id == `${this.id}-loading-bar`
    )!
  }

  toObject(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude.concat(["id"]))
  }
  toJSON(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude.concat(["id"]))
  }

  static fromObject(options: GenerationFrameOptions): Promise<fabric.GenerationFrame> {
    return fabric.util.enlivenObjects((options as any).objects).then((enlivenObjects) => {
      return new fabric.GenerationFrame(enlivenObjects, options)
    })
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
