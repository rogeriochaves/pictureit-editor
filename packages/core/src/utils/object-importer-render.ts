import { fabric } from "fabric"
import { LayerType, nonRenderableLayerTypes, transparentB64, transparentPattern } from "../common/constants"
import { updateObjectShadow } from "./fabric"
import {
  IBackground,
  IBackgroundImage,
  IGenerationFrame,
  IGroup,
  ILayer,
  IStaticImage,
  IStaticPath,
  IStaticText,
  IStaticVector,
} from "@layerhub-io/types"

class ObjectImporter {
  async import(item: any, params: any): Promise<fabric.Object> {
    let object
    switch (item.type) {
      case LayerType.STATIC_TEXT:
        object = await this.staticText(item)
        break
      case LayerType.STATIC_IMAGE:
        object = await this.staticImage(item)
        break
      case LayerType.BACKGROUND_IMAGE:
        object = await this.backgroundImage(item)
        break
      case LayerType.STATIC_VIDEO:
        object = await this.staticVideo(item)
        break
      case LayerType.STATIC_VECTOR:
        object = await this.staticVector(item)
        break
      case LayerType.STATIC_PATH:
        object = await this.staticPath(item)
        break
      case LayerType.BACKGROUND:
        object = await this.background(item)
        break
      case LayerType.GROUP:
        object = await this.group(item, params)
        break
      case LayerType.GENERATION_FRAME:
        object = await this.generationFrame(item, params)
        break
      default:
        object = await this.rect(item)
    }
    return object as fabric.Object
  }

  public staticText(item: ILayer): Promise<fabric.StaticText> {
    return new Promise((resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item)
        const metadata = item.metadata
        const { textAlign, fontFamily, fontSize, charSpacing, lineHeight, text, underline, fill } = item as IStaticText

        const textOptions = {
          ...baseOptions,
          underline,
          width: baseOptions.width ? baseOptions.width : 240,
          text: text ? text : "Empty Text",
          fill: fill ? fill : "#333333",
          ...(textAlign && { textAlign }),
          ...(fontFamily && { fontFamily }),
          ...(fontSize && { fontSize }),
          ...(charSpacing && { charSpacing }),
          ...(lineHeight && { lineHeight }),
          metadata,
        }
        // @ts-ignore
        const element = new fabric.StaticText(textOptions)

        updateObjectShadow(element, item.shadow)

        resolve(element)
      } catch (err) {
        reject(err)
      }
    })
  }

  public staticImage(item: ILayer): Promise<fabric.StaticImage> {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item)
        const { src, cropX, cropY } = item as IStaticImage

        const image = await fabric.util.loadImage(src, { crossOrigin: "anonymous" })
        const element = new fabric.StaticImage(image, {
          ...baseOptions,
          cropX: cropX || 0,
          cropY: cropY || 0,
        })
        updateObjectShadow(element, item.shadow)

        resolve(element)
      } catch (err) {
        reject(err)
      }
    })
  }

  public backgroundImage(item: ILayer): Promise<fabric.BackgroundImage> {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item)
        const { src, cropX, cropY } = item as IBackgroundImage

        const image = await fabric.util.loadImage(src, { crossOrigin: "anonymous" })
        const element = new fabric.BackgroundImage(image, {
          ...baseOptions,
          cropX: cropX || 0,
          cropY: cropY || 0,
        })
        updateObjectShadow(element, item.shadow)

        resolve(element)
      } catch (err) {
        reject(err)
      }
    })
  }

  public staticVideo(item: ILayer): Promise<fabric.StaticImage> {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item)
        const { preview: src, cropX, cropY } = item as IStaticImage

        const image = await fabric.util.loadImage(src as string, { crossOrigin: "anonymous" })
        const element = new fabric.StaticImage(image, {
          ...baseOptions,
          cropX: cropX || 0,
          cropY: cropY || 0,
        })
        updateObjectShadow(element, item.shadow)

        resolve(element)
      } catch (err) {
        reject(err)
      }
    })
  }

  public staticPath(item: ILayer): Promise<fabric.StaticPath> {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item)
        const { path, fill } = item as IStaticPath

        const element = new fabric.StaticPath({
          ...baseOptions,
          // @ts-ignore
          path,
          fill,
        })

        updateObjectShadow(element, item.shadow)

        resolve(element)
      } catch (err) {
        reject(err)
      }
    })
  }

  public group(item: ILayer, params: any): Promise<fabric.Group> {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item)
        let objects: fabric.Object[] = []

        for (const object of (item as IGroup).objects) {
          objects = objects.concat(await this.import(object, params))
        }
        // @ts-ignore
        const element = new fabric.Group(objects, baseOptions)

        updateObjectShadow(element, item.shadow)

        resolve(element)
      } catch (err) {
        reject(err)
      }
    })
  }

  public background(item: ILayer): Promise<fabric.Background> {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item)
        const { fill } = item as IBackground
        // @ts-ignore
        const element = new fabric.Background({
          ...baseOptions,
          fill: fill,
          id: "background",
          name: "",
        })

        resolve(element)
      } catch (err) {
        reject(err)
      }
    })
  }

  public rect(item: ILayer): Promise<fabric.Rect> {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item)
        const { fill } = item as any
        // @ts-ignore
        const element = new fabric.Rect({
          ...baseOptions,
          fill: typeof fill === "object" && fill.source == transparentB64 ? transparentPattern : fill,
          type: item.type,
        })

        resolve(element)
      } catch (err) {
        reject(err)
      }
    })
  }

  public staticVector(item: ILayer): Promise<fabric.StaticVector> {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item)
        const { src, colorMap = {} } = item as IStaticVector

        fabric.loadSVGFromURL(src, (objects, opts) => {
          const { width, height } = baseOptions
          if (!width || !height) {
            baseOptions.width = opts.width
            baseOptions.height = opts.height
          }

          const element = new fabric.StaticVector(objects, opts, {
            ...baseOptions,
            src,
            colorMap,
          })

          updateObjectShadow(element, item.shadow)

          resolve(element)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  public generationFrame(item: ILayer, params: any): Promise<fabric.GenerationFrame> {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item)
        const { fill } = item as IGenerationFrame
        let objects: fabric.Object[] = []

        for (const object of (item as IGenerationFrame).objects || []) {
          if (nonRenderableLayerTypes.includes(object.type)) {
            continue
          }
          objects = objects.concat(await this.import(object, params))
        }

        const element = new fabric.GenerationFrame(
          objects,
          // @ts-ignore
          {
            ...baseOptions,
            type: item.type,
            fill: typeof fill === "object" && fill.source == transparentB64 ? transparentPattern : fill,
          }
        )

        resolve(element)
      } catch (err) {
        reject(err)
      }
    })
  }

  getBaseOptions(item: ILayer) {
    const {
      id,
      name,
      left,
      top,
      width,
      height,
      scaleX,
      scaleY,
      opacity,
      flipX,
      flipY,
      skewX,
      skewY,
      stroke,
      strokeWidth,
      originX,
      originY,
      angle,
    } = item
    const metadata = item.metadata ? item.metadata : {}
    const baseOptions = {
      id,
      name,
      angle: angle,
      top: top,
      left: left,
      width: width,
      height: height,
      originX: originX || "left",
      originY: originY || "top",
      scaleX: scaleX || 1,
      scaleY: scaleY || 1,
      opacity: opacity ? opacity : 1,
      flipX: flipX ? flipX : false,
      flipY: flipY ? flipY : false,
      skewX: skewX ? skewX : 0,
      skewY: skewY ? skewY : 0,
      ...(stroke && { stroke }),
      strokeWidth: strokeWidth ? strokeWidth : 0,
      strokeDashArray: item.strokeDashArray ? item.strokeDashArray : null,
      strokeLineCap: item.strokeLineCap ? item.strokeLineCap : "butt",
      strokeLineJoin: item.strokeLineJoin ? item.strokeLineJoin : "miter",
      strokeUniform: item.strokeUniform || false,
      strokeMiterLimit: item.strokeMiterLimit ? item.strokeMiterLimit : 4,
      strokeDashOffset: item.strokeDashOffset ? item.strokeMiterLimit : 0,
      metadata: metadata,
    }
    return baseOptions
  }
}

export default ObjectImporter
