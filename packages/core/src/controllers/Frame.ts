import { ILayer } from "@layerhub-io/types"
import { fabric } from "fabric"
import { defaultFrameOptions, LayerType, defaultBackgroundOptions } from "../common/constants"
import { ControllerOptions, Dimension, GradientOptions } from "../common/interfaces"
import setObjectGradient from "../utils/fabric"
import Base from "./Base"

class Frame extends Base {
  constructor(props: ControllerOptions) {
    super(props)
    this.initialize()
  }

  initialize() {
    const frame = new fabric.Frame({
      ...defaultFrameOptions,
      absolutePositioned: this.config.clipToFrame,
    })
    const label = new fabric.Text("Frame", {
      type: LayerType.LABEL,
      selectable: false,
      hasControls: false,
      evented: false,
      fontSize: 22,
      fill: defaultFrameOptions.stroke,
      fontFamily: "Uber Move Text, sans-serif",
      ...this.labelPosition(frame),
    })

    // const background = new fabric.Background({
    //   ...defaultBackgroundOptions,
    //   shadow: this.config.shadow,
    // })

    this.canvas.add(frame, label)
    // const center = this.canvas.getCenter()
    // frame.center()
    // background.center()

    this.state.setFrame({
      height: defaultFrameOptions.width,
      width: defaultFrameOptions.height,
    })

    // setTimeout(() => {
    //   this.editor.zoom.zoomToFit()
    //   this.editor.history.initialize()
    // }, 50)
  }

  get frame() {
    return this.canvas.getObjects().find((object) => object.type === LayerType.FRAME) as Required<fabric.Frame>
  }

  get label() {
    return this.canvas.getObjects().find((object) => object.type === LayerType.LABEL) as Required<fabric.Frame>
  }

  labelPosition(frame: fabric.Frame) {
    return { top: (frame.top || 0) - 30, left: frame.left }
  }

  get background() {
    return this.canvas
      .getObjects()
      .find((object) => object.type === LayerType.BACKGROUND) as Required<fabric.Background>
  }

  get options(): Required<ILayer> {
    const options = this.frame.toJSON(this.config.propertiesToInclude)
    return options as Required<ILayer>
  }

  public resize({ height, width }: Dimension) {
    this.state.setFrame({
      height,
      width,
    })
    const frame = this.frame
    const background = this.background
    frame.set({ width, height })
    frame.center()
    this.label.set(this.labelPosition(frame))
    if (background) {
      background.set({ width, height })
      background.center()
    }
    this.editor.zoom.zoomToFit()
  }

  public setHoverCursor = (cursor: string) => {
    const background = this.background
    if (background) {
      background.set("hoverCursor", cursor)
    }
  }

  public setBackgroundColor = (color: string) => {
    const background = this.background
    if (background) {
      background.set({
        fill: color,
      })
      this.canvas.requestRenderAll()
      this.editor.history.save()
    }
  }

  public setBackgroundGradient = ({ angle, colors }: GradientOptions) => {
    const background = this.background
    if (background) {
      setObjectGradient(background, angle, colors)
      this.canvas.requestRenderAll()
      this.editor.history.save()
    }
  }

  public getBoundingClientRect() {
    const frame = this.frame
    return frame.getBoundingRect()
  }

  get fitRatio() {
    const options = this.frame as Required<fabric.Frame>
    const canvasWidth = this.canvas.getWidth() - this.config.frameMargin
    const canvasHeight = this.canvas.getHeight() - this.config.frameMargin
    let scaleX = canvasWidth / options.width
    let scaleY = canvasHeight / options.height
    if (options.height >= options.width) {
      scaleX = scaleY
      if (canvasWidth < options.width * scaleX) {
        scaleX = scaleX * (canvasWidth / (options.width * scaleX))
      }
    } else {
      if (canvasHeight < options.height * scaleX) {
        scaleX = scaleX * (canvasHeight / (options.height * scaleX))
      }
    }
    return scaleX
  }
}
export default Frame
