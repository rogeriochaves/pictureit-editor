import { fabric } from "fabric"
import { IScene, ILayer } from "@layerhub-io/types"
import ObjectImporter from "../utils/object-importer-render"

class Renderer {
  public async render(template: IScene) {
    return await this.toDataURL(template, {})
  }

  public async renderCanvas(template: IScene) : Promise<HTMLCanvasElement> {
    return new Promise(async (resolve, reject) => {
      const staticCanvas = new fabric.StaticCanvas(null)
      await this.loadTemplate(staticCanvas, template, {})
      const canvas = staticCanvas.toCanvasElement(1, {
        top: template.top ?? 0,
        left: template.left ?? 0,
        height: staticCanvas.getHeight(),
        width: staticCanvas.getWidth(),
      })

      resolve(canvas)
    })
  }

  public async toDataURL(template: IScene, params: Record<string, any>) {
    return new Promise(async (resolve, reject) => {
      const staticCanvas = new fabric.StaticCanvas(null)
      await this.loadTemplate(staticCanvas, template, params)
      const data = staticCanvas.toDataURL({
        top: 0,
        left: 0,
        height: staticCanvas.getHeight(),
        width: staticCanvas.getWidth(),
      })

      resolve(data)
    })
  }

  public renderLayer = (layer: Required<ILayer>, params: {}) => {
    return new Promise(async (resolve, reject) => {
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
      const data = staticCanvas.toDataURL({
        top: 0,
        left: 0,
        height: staticCanvas.getHeight(),
        width: staticCanvas.getWidth(),
      })
      resolve(data)
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
