import { fabric } from "fabric"
import { IScene, ILayer } from "@layerhub-io/types"
import ObjectImporter from "../utils/object-importer-render"

class Renderer {
  public async render(template: IScene) {
    return await this.toDataURL(template, {})
  }

  public async renderWebp(template: IScene) {
    const staticCanvas = new fabric.StaticCanvas(null)
    await this.loadTemplate(staticCanvas, template, {})

    return staticCanvas.toCanvasElement().toDataURL("image/webp")
  }

  public async renderCanvas(template: IScene): Promise<HTMLCanvasElement> {
    const staticCanvas = new fabric.StaticCanvas(null)
    await this.loadTemplate(staticCanvas, template, {})

    return staticCanvas.toCanvasElement(1, {
      top: template.top ?? 0,
      left: template.left ?? 0,
      height: staticCanvas.getHeight(),
      width: staticCanvas.getWidth(),
    })
  }

  public async toDataURL(template: IScene, params: Record<string, any>) {
    const staticCanvas = new fabric.StaticCanvas(null)
    await this.loadTemplate(staticCanvas, template, params)

    return staticCanvas.toDataURL({
      top: 0,
      left: 0,
      height: staticCanvas.getHeight(),
      width: staticCanvas.getWidth(),
    })
  }

  public renderLayer = async (layer: Required<ILayer>, params: object) => {
    const staticCanvas = new fabric.StaticCanvas(null)
    await this.loadTemplate(
      staticCanvas,
      {
        id: layer.id,
        metadata: {},
        layers: [{ ...layer, top: 0, left: 0 }],
        frame: {
          width: layer.width * layer.scaleX,
          height: layer.height * layer.scaleY,
        },
      },
      params
    )
    return staticCanvas.toDataURL({
      top: 0,
      left: 0,
      height: staticCanvas.getHeight(),
      width: staticCanvas.getWidth(),
    })
  }

  private async loadTemplate(staticCanvas: fabric.StaticCanvas, template: IScene, params: Record<string, any>) {
    const { frame } = template
    this.setDimensions(staticCanvas, frame)
    const objectImporter = new ObjectImporter()

    for (const layer of template.layers) {
      const element = await objectImporter.import(layer, params)
      if (element) {
        staticCanvas.add(element)
      } else {
        console.log("UNABLE TO LOAD LAYER: ", layer)
        console.trace()
      }
    }
  }

  private setDimensions(staticCanvas: fabric.StaticCanvas, { width, height }: { width: number; height: number }) {
    staticCanvas.setWidth(width).setHeight(height)
  }
}

export default Renderer
