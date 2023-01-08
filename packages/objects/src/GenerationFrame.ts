import { fabric } from "fabric"
import { StaticImageObject } from "./StaticImage"

export type InitImage = {
  image?: string
  noise?: number
  fixed: boolean
  promptStrength?: number
}

export type ModelTypes =
  | "stable-diffusion"
  | "stable-diffusion-inpainting"
  | "openjourney"
  | "stable-diffusion-animation"

// @ts-ignore
export class GenerationFrameObject extends fabric.Group {
  static type = "GenerationFrame"
  id: string
  metadata?: {
    model?: ModelTypes
    prompt?: string
    negativePrompt?: string
    promptEnd?: string
    steps?: number
    guidance?: number
    initImage?: InitImage
    accumulatedSteps?: number,
    numAnimationFrames?: number,
    numInterpolationSteps?: number,
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
              erasable: false,
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
      erasable: "deep",
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

    const background = this.getBackground()
    if (background) {
      background.erasable = false
    }

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
          evented: false,
        })

        if (staticImage.width > this.width) {
          staticImage.scaleToWidth(this.width)
        } else if (staticImage.height > this.height) {
          staticImage.scaleToHeight(this.height)
        }

        const centerY = Math.round(this.top + this.height / 2)
        const centerX = Math.round(this.left + this.width / 2)
        const imgHalfHeight = Math.round((staticImage.height * staticImage.scaleY) / 2)
        const imgHalfWidth = Math.round((staticImage.width * staticImage.scaleX) / 2)

        staticImage.top = centerY - imgHalfHeight
        staticImage.left = centerX - imgHalfWidth

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

  showLoading(duration: number, step: string = undefined) {
    const currentLoadingStepLabel = this.getLoadingStepLabel()
    let loadingStepLabel: fabric.Text
    if (step && currentLoadingStepLabel && step == currentLoadingStepLabel.text) {
      return
    } else if (step) {
      if (currentLoadingStepLabel) {
        this.canvas.remove(currentLoadingStepLabel)
      }
      loadingStepLabel = new fabric.Text(step, {
        type: "GenericNonRenderable",
        top: this.top + 4,
        left: this.left + 8,
        //@ts-ignore
        id: `${this.id}-loading-step-label`,
        selectable: false,
        hasControls: false,
        evented: false,
        fontSize: 19,
        fill: "rgba(255, 255, 255, 1)",
        fontFamily: "Uber Move Text, sans-serif",
        erasable: false,
      })
    }

    if (this.loadingAnimation) {
      // cancels animation
      this.loadingAnimation()
    }
    const previousLoadingBar = this.getLoadingBar()
    if (previousLoadingBar) {
      this.canvas.remove(previousLoadingBar)
    }

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
      width: loadingStepLabel ? loadingStepLabel.width + 24 : 1,
      height: 32,
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
    if (loadingStepLabel) {
      this.canvas.add(loadingStepLabel)
    }

    this.loadingAnimation = loadingBar.animate("width", this.width * 0.95, {
      onChange: this.canvas.requestRenderAll.bind(this.canvas),
      duration,
      easing: fabric.util.ease.easeInOutQuad,
    }) as any

    this.canvas.requestRenderAll()
  }

  moveLoading(to: number, duration: number) {
    const loadingBar = this.getLoadingBar()
    if (!loadingBar) return

    const loadingStepLabel = this.getLoadingStepLabel()
    if (loadingStepLabel) {
      this.canvas.remove(loadingStepLabel)
    }

    if (this.loadingAnimation) {
      // cancels animation
      this.loadingAnimation()
    }
    this.loadingAnimation = loadingBar.animate("width", this.width * to, {
      onChange: this.canvas.requestRenderAll.bind(this.canvas),
      duration,
      easing: fabric.util.ease.easeInOutQuad,
    }) as any
  }

  finishLoading() {
    const loadingBar = this.getLoadingBar()
    if (!loadingBar) return

    this.removeLoading()
    this.canvas.add(loadingBar)
    loadingBar.width = this.width
    loadingBar.animate("opacity", 0, {
      onChange: this.canvas.requestRenderAll.bind(this.canvas),
      onComplete: () => {
        this.canvas?.remove(loadingBar)
      },
      duration: 1000,
    })
  }

  removeLoading() {
    const loadingBar = this.getLoadingBar()
    if (loadingBar) {
      this.canvas.remove(loadingBar)
    }
    if (this.loadingAnimation) {
      // cancels animation
      this.loadingAnimation()
    }
    const loadingStepLabel = this.getLoadingStepLabel()
    if (loadingStepLabel) {
      this.canvas.remove(loadingStepLabel)
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

  getLoadingStepLabel(canvas?) : fabric.Text | undefined {
    return (canvas || this.canvas)?.getObjects().find(
      (object) =>
        //@ts-ignore
        object.id == `${this.id}-loading-step-label`
    )
  }

  getError() {
    return this._objects.find(
      (object) =>
        //@ts-ignore
        object.id == `${this.id}-error`
    )
  }

  getImage() {
    return this._objects.find(
      (object) =>
        //@ts-ignore
        object.id == `${this.id}-image`
    )
  }

  getNoise() {
    if (this.metadata?.initImage?.noise) return this.metadata?.initImage?.noise
    if (!this.getImage() && this._objects?.find((o) => o.type == "StaticPath")) {
      return 2
    }
    return 0
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
