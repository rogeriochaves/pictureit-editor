import Text from "./Text"
import Path from "./Drawing"
import DrawingTool from "./DrawingTool"
import Image from "./Image"
import Vector from "./Vector"
import Locked from "./Locked"
import Multiple from "./Multiple"
import Canvas from "./Canvas"
import GenerationFrame from "./GenerationFrame"
import { PanelType } from "../../../../constants/app-options"

export const ToolItems = {
  [PanelType.DRAWING]: DrawingTool,
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
