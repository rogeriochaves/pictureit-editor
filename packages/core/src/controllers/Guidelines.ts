import Base from "./Base"
import { fabric } from "fabric"
import { nonRenderableLayerTypes } from "../common/constants"
import { LayerType } from "../common/constants"

type CoordsVertical = { x: number; y1: number; y2: number }
type CoordsHorizontal = { x1: number; x2: number; y: number }

class Guidelines extends Base {
  public viewportTransform: number[] = []
  public aligningLineOffset: any
  public aligningLineMargin: any
  public aligningLineWidth: any
  public aligningLineColor: any
  public ctx: CanvasRenderingContext2D
  constructor(props: any) {
    super(props)
    this.initAligningGuidelines(this.canvas)
  }

  initAligningGuidelines(canvas: fabric.Canvas) {
    let viewportTransform = canvas.viewportTransform!

    const ctx = canvas.getSelectionContext(),
      aligningLineOffset = 0,
      aligningLineMargin = 16,
      aligningLineWidth = 1.2,
      aligningLineColor = "#e056fd"
    let zoom = canvas.getZoom()

    function drawVerticalLine(coords: CoordsVertical) {
      drawLine(
        coords.x + 0.5,
        coords.y1 > coords.y2 ? coords.y2 : coords.y1,
        coords.x + 0.5,
        coords.y2 > coords.y1 ? coords.y2 : coords.y1
      )
    }

    function drawHorizontalLine(coords: CoordsHorizontal) {
      drawLine(
        coords.x1 > coords.x2 ? coords.x2 : coords.x1,
        coords.y + 0.5,
        coords.x2 > coords.x1 ? coords.x2 : coords.x1,
        coords.y + 0.5
      )
    }

    function drawLine(x1: number, y1: number, x2: number, y2: number) {
      const vt = canvas.viewportTransform!
      ctx.save()
      ctx.lineWidth = aligningLineWidth
      ctx.strokeStyle = aligningLineColor
      ctx.beginPath()
      ctx.moveTo((x1 + viewportTransform[4] / vt[0]) * zoom, (y1 + viewportTransform[5] / vt[0]) * zoom)
      ctx.lineTo((x2 + viewportTransform[4] / vt[0]) * zoom, (y2 + viewportTransform[5] / vt[0]) * zoom)
      ctx.stroke()
      ctx.restore()
    }

    function isInRange(value1: any, value2: any, customAligningLineMargin?: number) {
      const aligningMargin = customAligningLineMargin ? customAligningLineMargin : aligningLineMargin
      value1 = Math.round(value1)
      value2 = Math.round(value2)
      for (let i = value1 - aligningMargin, len = value1 + aligningMargin; i <= len; i++) {
        if (i === value2) {
          return true
        }
      }
      return false
    }

    const verticalLines: any[] = []
    const horizontalLines: any[] = []

    canvas.on("mouse:down", function () {
      viewportTransform = canvas.viewportTransform!
      zoom = canvas.getZoom()
    })

    canvas.on("object:moving", function (e) {
      const activeObject = e.target
      if (!activeObject) return

      const canvasObjects = canvas.getObjects(),
        activeObjectCenter = activeObject.getCenterPoint(),
        activeObjectLeft = activeObjectCenter.x,
        activeObjectTop = activeObjectCenter.y,
        activeObjectBoundingRect = activeObject.getBoundingRect(),
        activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3],
        activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0],
        //@ts-ignore
        transform = canvas._currentTransform,
        groupAdjustLeft = activeObject.group?.getCenterPoint()?.x ?? 0,
        groupAdjustTop = activeObject.group?.getCenterPoint()?.y ?? 0

      let horizontalInTheRange = false,
        verticalInTheRange = false

      if (!transform) return

      let snapLeft: number | undefined = undefined
      let snapTop: number | undefined = undefined

      // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
      // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

      for (let i = canvasObjects.length; i--; ) {
        if (
          canvasObjects[i] === activeObject ||
          (canvasObjects[i].type !== LayerType.FRAME &&
            nonRenderableLayerTypes.includes(canvasObjects[i].type || "")) ||
          // canvasObjects[i].type === "Background" ||
          canvasObjects[i].id?.match(/^-rect$/)
        )
          continue
        const objectCenter = canvasObjects[i].getCenterPoint(),
          objectLeft = objectCenter.x,
          objectTop = objectCenter.y,
          objectBoundingRect = canvasObjects[i].getBoundingRect(),
          objectHeight = objectBoundingRect.height / viewportTransform[3],
          objectWidth = objectBoundingRect.width / viewportTransform[0]
        const backgroundImageMargin =
          activeObject.type === "BackgroundImage" && canvasObjects[i].type === "Frame" ? 30 : undefined
        // snap by the horizontal center line
        if (isInRange(objectLeft, activeObjectLeft, backgroundImageMargin)) {
          verticalInTheRange = true
          if (canvasObjects[i].type === "Frame") {
            verticalLines.push({
              x: objectLeft,
              y1: -5000,
              y2: 5000,
            })
          } else {
            verticalLines.push({
              x: objectLeft,
              y1:
                objectTop < activeObjectTop
                  ? objectTop - objectHeight / 2 - aligningLineOffset
                  : objectTop + objectHeight / 2 + aligningLineOffset,
              y2:
                activeObjectTop > objectTop
                  ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
                  : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
            })
          }

          snapLeft = objectLeft
        }

        // snap by the left edge
        if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2, backgroundImageMargin)) {
          verticalInTheRange = true

          if (canvasObjects[i].type === "Frame") {
            verticalLines.push({
              x: objectLeft - objectWidth / 2,
              y1: -5000,
              y2: 5000,
            })
          } else {
            verticalLines.push({
              x: objectLeft - objectWidth / 2,
              y1:
                objectTop < activeObjectTop
                  ? objectTop - objectHeight / 2 - aligningLineOffset
                  : objectTop + objectHeight / 2 + aligningLineOffset,
              y2:
                activeObjectTop > objectTop
                  ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
                  : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
            })
          }

          snapLeft = objectLeft - objectWidth / 2 + activeObjectWidth / 2
        }

        // snap by the right edge
        if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2, backgroundImageMargin)) {
          verticalInTheRange = true

          if (canvasObjects[i].type === "Frame") {
            verticalLines.push({
              x: objectLeft + objectWidth / 2,
              y1: -5000,
              y2: 5000,
            })
          } else {
            verticalLines.push({
              x: objectLeft + objectWidth / 2,
              y1:
                objectTop < activeObjectTop
                  ? objectTop - objectHeight / 2 - aligningLineOffset
                  : objectTop + objectHeight / 2 + aligningLineOffset,
              y2:
                activeObjectTop > objectTop
                  ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
                  : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
            })
          }

          snapLeft = objectLeft + objectWidth / 2 - activeObjectWidth / 2
        }

        // snap by the vertical center line
        if (isInRange(objectTop, activeObjectTop, backgroundImageMargin)) {
          horizontalInTheRange = true

          if (canvasObjects[i].type === "Frame") {
            horizontalLines.push({
              y: objectTop,
              x1: -5000,
              x2: 5000,
            })
          } else {
            horizontalLines.push({
              y: objectTop,
              x1:
                objectLeft < activeObjectLeft
                  ? objectLeft - objectWidth / 2 - aligningLineOffset
                  : objectLeft + objectWidth / 2 + aligningLineOffset,
              x2:
                activeObjectLeft > objectLeft
                  ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
                  : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
            })
          }

          snapTop = objectTop
        }

        // snap by the top edge
        if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2, backgroundImageMargin)) {
          horizontalInTheRange = true

          if (canvasObjects[i].type === "Frame") {
            horizontalLines.push({
              y: objectTop - objectHeight / 2,
              x1: -5000,
              x2: 5000,
            })
          } else {
            horizontalLines.push({
              y: objectTop - objectHeight / 2,
              x1:
                objectLeft < activeObjectLeft
                  ? objectLeft - objectWidth / 2 - aligningLineOffset
                  : objectLeft + objectWidth / 2 + aligningLineOffset,
              x2:
                activeObjectLeft > objectLeft
                  ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
                  : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
            })
          }

          snapTop = objectTop - objectHeight / 2 + activeObjectHeight / 2
        }

        // snap by the bottom edge
        if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2, backgroundImageMargin)) {
          horizontalInTheRange = true

          if (canvasObjects[i].type === "Frame") {
            horizontalLines.push({
              y: objectTop + objectHeight / 2,
              x1: -5000,
              x2: 5000,
            })
          } else {
            horizontalLines.push({
              y: objectTop + objectHeight / 2,
              x1:
                objectLeft < activeObjectLeft
                  ? objectLeft - objectWidth / 2 - aligningLineOffset
                  : objectLeft + objectWidth / 2 + aligningLineOffset,
              x2:
                activeObjectLeft > objectLeft
                  ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
                  : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
            })
          }

          snapTop = objectTop + objectHeight / 2 - activeObjectHeight / 2
        }
      }

      if (!horizontalInTheRange) {
        horizontalLines.length = 0
      }

      if (!verticalInTheRange) {
        verticalLines.length = 0
      }

      if (snapLeft !== undefined || snapTop !== undefined) {
        activeObject.setPositionByOrigin(
          new fabric.Point(
            (snapLeft || activeObjectLeft) - groupAdjustLeft,
            (snapTop || activeObjectTop) - groupAdjustTop
          ),
          "center",
          "center"
        )
      }
    })

    canvas.on("before:render", function () {
      //@ts-ignore
      canvas.clearContext(canvas.contextTop)
    })

    canvas.on("after:render", function () {
      for (let i = verticalLines.length; i--; ) {
        drawVerticalLine(verticalLines[i])
      }
      for (let i = horizontalLines.length; i--; ) {
        drawHorizontalLine(horizontalLines[i])
      }

      verticalLines.length = horizontalLines.length = 0
    })

    canvas.on("mouse:up", function () {
      verticalLines.length = horizontalLines.length = 0
      canvas.renderAll()
    })
  }
}

export default Guidelines
