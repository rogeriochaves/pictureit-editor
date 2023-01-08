import Base from "./Base"
import { fabric } from "fabric"
import throttle from "lodash/throttle"
import { nonRenderableLayerTypes } from "../common/constants"

type HistoryAction = {
  type: "UPDATE"
  objects: object[]
  extras: { [key: string]: any }
}

class History extends Base {
  private history: HistoryAction[] = []
  private index: number = 0
  private isActive: boolean = false

  public getStatus = () => {
    return {
      history: this.history,
      index: this.index,
      hasUndo: this.index > 0,
      hasRedo: this.history.length - 1 > this.index,
    }
  }

  public runWithoutAffectingHistory = async (fn: () => Promise<unknown>) => {
    this.isActive = true
    const result = await fn()
    this.isActive = false
    return result
  }

  public push = (action: HistoryAction) => {
    this.history = this.history.slice(0, this.index + 1)
    this.history.push(action)
    this.index = this.history.length - 1
    this.emitSaved()
  }

  public amend = (extras: { [key: string]: any }) => {
    const current = this.history[this.index]
    if (current) {
      current.extras = { ...current.extras, ...extras }
    }
  }

  public save = () => {
    if (this.isActive) return
    try {
      const canvasJSON = this.canvas.toObject(this.config.propertiesToInclude) as any
      canvasJSON.objects.forEach((object: fabric.Object) => {
        if (object.clipPath) {
          fabric.util.enlivenObjects([object.clipPath]).then((objects) => {
            object.clipPath = objects[0]
          })
        }
      })

      const objects = canvasJSON.objects.filter((object: any) => !nonRenderableLayerTypes.includes(object.type || ""))
      const nextHistory: HistoryAction = {
        type: "UPDATE",
        objects,
        extras: {},
      }

      const current = this.history[this.index]
      if (JSON.stringify(current?.objects) !== JSON.stringify(nextHistory.objects)) {
        this.push(nextHistory)
      }
    } catch (err) {
      console.log(err)
    }
    this.emitStatus()
  }

  public undo = throttle(() => {
    this.restore(this.index - 1)
  }, 100)

  public redo = throttle(() => {
    this.restore(this.index + 1)
  }, 100)

  private restore = (index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), this.history.length - 1)
    if (this.index == nextIndex) return

    const action = this.history[nextIndex]
    if (!action) return

    let wait = 0
    if (this.editor.canvas.canvas.getActiveObject()) {
      this.canvas.discardActiveObject()
      wait = 100
    }

    setTimeout(() => {
      this.isActive = true
      this.editor.objects.clear()
      fabric.util.enlivenObjects(action.objects).then((enlivenObjects) => {
        enlivenObjects.forEach((enlivenObject) => {
          if (!nonRenderableLayerTypes.includes(enlivenObject.type || "")) {
            this.canvas.add(enlivenObject)
          }
        })
        this.emitStatus()
        this.emitRestored()
        setTimeout(() => {
          this.isActive = false
        }, 100)
      })
      this.index = nextIndex
    }, wait)
  }

  public reset = () => {
    this.history = []
    this.emitStatus()
  }

  private emitStatus = () => {
    this.editor.emit("history:changed")
  }

  private emitSaved = () => {
    this.editor.emit("history:saved")
  }

  private emitRestored = () => {
    this.editor.emit("history:restored", this.history[this.index])
  }
}

export default History
