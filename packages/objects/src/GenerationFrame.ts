import { fabric } from "fabric"
import { StaticImageObject } from "./StaticImage"

export type InitImage = {
  image?: string
  noise?: number
  fixed: boolean
  promptStrength?: number
}

// @ts-ignore
export class GenerationFrameObject extends fabric.Group {
  static type = "GenerationFrame"
  id: string
  metadata?: {
    prompt?: string
    steps?: number
    guidance?: number
    initImage?: InitImage
  }
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
              id: `${id}-background`,
              type: "rect",
              selectable: false,
              hasControls: false,
              hasBorders: false,
              evented: false,
            }),
          ]

    const initOptions = {
      ...options,
      id,
      type: GenerationFrameObject.type,
      layout: "clip-path",
      clipPath: clipPath,
      subTargetCheck: true,
      interactive: true,
    }
    //@ts-ignore
    super.initialize(groupObjects, initOptions, true)

    // for some reason top, left, width and height are overwritten misteriously after initialize after fromObject
    this.top = options.top
    this.left = options.left
    this.width = options.width
    this.height = options.height

    this.on("moving", this.onMove)
    this.on("resizing", this.adjustClipPath)
    this.on("scaling", this.adjustClipPath)
    this.adjustClipPath()
    this.adjustBackground()

    return this
  }

  private onMove() {
    this.adjustClipPath()
    this.adjustLoading()
  }

  public adjustClipPath() {
    this.clipPath.set({
      top: this.top,
      left: this.left,
      width: this.width * this.scaleX,
      height: this.height * this.scaleY,
    })
  }

  public adjustLoading() {
    const loading = this.getLoadingBar()
    if (loading) {
      loading.set({
        top: this.top,
        left: this.left,
      })
    }
  }

  public adjustBackground() {
    const background = this.getBackground()
    if (background) {
      background.set({
        width: this.width / this.scaleX,
        height: this.height / this.scaleY,
      })
    }
  }

  async setImage(src: string) {
    return fabric.util
      .loadImage(src, { crossOrigin: "anonymous" })
      .then((img) => {
        this.removeError()
        const nonRectObjects = this._objects.filter(
          (item) => (item as any).id != `${this.id}-background` && (item as any).id != `${this.id}-loading-bar`
        )
        for (const object of nonRectObjects) {
          this.remove(object)
        }

        if (!img) {
          this.showError("Error loading image")
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
        this.finishLoading()
      })
      .catch((e) => {
        console.error("Error loading image", e)

        this.showError("Error loading image")
      })
  }

  showError(message: string) {
    const errorText = new fabric.StaticText({
      //@ts-ignore
      id: `${this.id}-error`,
      top: this.top + this.height / 2,
      left: this.left,
      width: this.width,
      text: message,
      fontFamily: "Uber Move Text, sans-serif",
      fontSize: 18,
      editable: false,
      textAlign: "center",
      originY: "center",
      evented: false,
    })
    this.add(errorText as any)
    this.finishLoading()

    return
  }

  removeError() {
    const error = this.getError()
    if (error) {
      this.remove(error)
    }
  }

  showLoading(duration: number) {
    this.removeError()
    const loadingBar = new fabric.Rect({
      top: this.top,
      left: this.left,
      //@ts-ignore
      id: `${this.id}-loading-bar`,
      type: "GenericNonRenderable",
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

    this.canvas.add(loadingBar)

    this.loadingAnimation = loadingBar.animate("width", this.width * 0.95, {
      onChange: this.canvas.requestRenderAll.bind(this.canvas),
      duration,
      easing: fabric.util.ease.easeInOutQuad,
    }) as any

    this.canvas.requestRenderAll()
  }

  finishLoading() {
    const loadingBar = this.getLoadingBar()
    if (loadingBar) {
      if (this.loadingAnimation) {
        // cancels animation
        this.loadingAnimation()
      }
      this.canvas.remove(loadingBar)
      this.canvas.add(loadingBar)
      loadingBar.width = this.width
      loadingBar.animate("opacity", 0, {
        onChange: this.canvas.requestRenderAll.bind(this.canvas),
        onComplete: () => {
          this.canvas.remove(loadingBar)
        },
        duration: 1000,
      })
    }
  }

  getBackground() {
    return this._objects.find(
      (object) =>
        //@ts-ignore
        object.id == `${this.id}-background`
    )
  }

  getLoadingBar(canvas?) {
    return (canvas || this.canvas)?.getObjects().find(
      (object) =>
        //@ts-ignore
        object.id == `${this.id}-loading-bar`
    )
  }

  getError() {
    return this._objects.find(
      (object) =>
        //@ts-ignore
        object.id == `${this.id}-error`
    )
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
