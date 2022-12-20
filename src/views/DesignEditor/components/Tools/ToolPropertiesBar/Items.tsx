import Text from "./Text"
import Path from "./Drawing"
import DrawingTool from "./DrawingTool"
import Image from "./Image"
import Vector from "./Vector"
import Locked from "./Locked"
import Multiple from "./Multiple"
import Canvas from "./Canvas"
import GenerationFrame from "./GenerationFrame"
import GenerationTool from "./GenerationTool"
import { ToolType } from "../../../../../state/designEditor"
import EraserTool from "./EraserTool"

export const ToolItems = {
  [ToolType.GENERATION]: GenerationTool,
  [ToolType.DRAWING]: DrawingTool,
  [ToolType.ERASER]: EraserTool,
}

export default {
  StaticText: Text,
  StaticPath: Path,
  StaticImage: Image,
  StaticVector: Vector,
  Locked,
  Multiple,
  Canvas,
  GenerationFrame,
}
