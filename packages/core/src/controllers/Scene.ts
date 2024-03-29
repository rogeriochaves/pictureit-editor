import { fabric } from "fabric"
import { nanoid } from "nanoid"
import { IScene, ILayer } from "@layerhub-io/types"
import { LayerType, nonRenderableLayerTypes } from "../common/constants"
import ObjectExporter from "../utils/object-exporter"
import ObjectImporter from "../utils/object-importer"
import getSelectionType from "../utils/get-selection-type"
import Base from "./Base"
import parseSVG from "../parser"
import { base64ImageToFile } from "../utils/parser"

class Scene extends Base {
  private id: string = ""
  private name?: string = ""

  public exportToJSON(): IScene {
    const animated = false

    const canvasJSON: any = this.canvas.toObject(this.config.propertiesToInclude)
    const frame = this.editor.frame.options
    const template: IScene = {
      id: this.id ? this.id : nanoid(),
      name: this.name ? this.name : "New Artwork",
      layers: [],
      frame: {
        width: frame.width,
        height: frame.height,
      },
      metadata: {
        animated,
      },
    }

    const layers = canvasJSON.objects.filter((object: any) => !nonRenderableLayerTypes.includes(object.type))
    const objectExporter = new ObjectExporter()

    layers.forEach((layer: ILayer) => {
      const exportedObject = objectExporter.export(layer, frame)
      template.layers = template.layers.concat(exportedObject)
    })
    template.metadata = {
      ...template.metadata,
      animated,
    }
    return template
  }

  public exportAsComponent = async () => {
    const activeObject = this.canvas.getActiveObject()
    const selectionType = getSelectionType(activeObject)
    const frame = this.editor.frame.options
    const objectExporter = new ObjectExporter()
    if (activeObject && selectionType) {
      const isMixed = selectionType.length > 1

      if (
        activeObject.type === "activeSelection" ||
        activeObject.type === "group" ||
        activeObject.type == LayerType.GENERATION_FRAME
      ) {
        let clonedObjects: any[] = []
        // @ts-ignore
        const objects = activeObject._objects
        for (const object of objects!) {
          const cloned = await new Promise((resolve) => {
            object.clone((c: fabric.Object) => {
              c.clipPath = undefined
              resolve(c)
            }, this.editor.config.propertiesToInclude)
          })
          clonedObjects = clonedObjects.concat(cloned)
        }

        const group = new fabric.Group(clonedObjects)
        const component = objectExporter.export(group.toObject(this.editor.config.propertiesToInclude), frame) as any
        const metadata = component.metadata ? component.metadata : {}

        return {
          ...component,
          top: 0,
          left: 0,
          metadata: {
            ...metadata,
            category: isMixed ? "mixed" : "single",
            types: selectionType,
          },
        }
      } else {
        const component = objectExporter.export(activeObject.toObject(this.editor.config.propertiesToInclude), frame)
        const metadata = component.metadata ? component.metadata : {}
        return {
          ...component,
          top: 0,
          left: 0,
          metadata: {
            ...metadata,
            category: isMixed ? "mixed" : "single",
            types: selectionType,
          },
        }
      }
    }
  }

  /**
   * Export Canvas objects to be loaded as resources by PIXI loader
   * @returns
   */
  public exportLayers = async (template: IScene) => {
    const elements: any[] = []

    for (const [index, layer] of template.layers.entries()) {
      // @ts-ignore
      const preview = template.preview // await this.editor.renderer.renderLayer(layer, {})
      if (!preview) {
        continue
      }
      const objectURL = base64ImageToFile(preview)
      elements.push({
        id: nanoid(),
        type: "StaticImage",
        url: objectURL,
        duration: 5000,
        display: {
          from: 0,
          to: 5000,
        },
        cut: {
          from: 0,
          to: 0,
        },
        position: {
          x: 0,
          y: 0,
          zIndex: index,
          width: layer.width,
          height: layer.height,
          scaleX: layer.scaleX || 1,
          scaleY: layer.scaleY || 1,
        },
        objectId: nanoid(),
      })
    }
    return elements
  }

  /**
   * Deserializes JSON data
   * @returns Json Template
   */
  public importFromJSON = async (template: IScene) => {
    this.name = template.name
    this.id = template.id
    const frameParams = template.frame
    this.editor.objects.clear()
    this.editor.frame.resize({
      width: frameParams.width,
      height: frameParams.height,
    })

    const frame = this.editor.frame.frame as any
    const objectImporter = new ObjectImporter(this.editor)
    const updatedTemplateLayers = template.layers.map((layer) => {
      if (layer.type === LayerType.BACKGROUND) {
        return {
          ...layer,
          shadow: this.config.shadow,
        }
      }
      return layer
    })
    for (const layer of updatedTemplateLayers as Required<ILayer[]>) {
      const element = await objectImporter.import(layer, frame)
      if (element) {
        if (this.config.clipToFrame) {
          element.clipPath = frame as unknown as fabric.Object
        }
        this.canvas.add(element)
      } else {
        console.log("UNABLE TO LOAD OBJECT: ", layer)
      }
    }
    this.editor.zoom.zoomToFit()
    this.editor.objects.updateContextObjects()
    this.editor.history.save()
  }

  public async importFromSVG(url: string) {
    const design = await parseSVG(url)
    // @ts-ignore
    this.importFromJSON(design)
  }
}
export default Scene
