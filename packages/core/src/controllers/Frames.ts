import { FrameOptions } from "@layerhub-io/objects"
import { ControllerOptions, Dimension, GradientOptions } from "../common/interfaces"
import Base from "./Base"
import Frame from "./Frame"

class Frames extends Base {
  public frames: Frame[]

  constructor(props: ControllerOptions, initialFrame: Frame) {
    super(props)
    this.frames = [initialFrame]
  }

  public add(options: Partial<FrameOptions>) {
    this.frames.push(
      new Frame(
        {
          canvas: this.canvas,
          config: { ...this.config, background: "red" },
          state: this.state,
          editor: this.editor,
        },
        options
      )
    )
  }

  public get(n: number): Frame | undefined {
    return this.frames[n]
  }

  public length(): number {
    return this.frames.length
  }
}
export default Frames
