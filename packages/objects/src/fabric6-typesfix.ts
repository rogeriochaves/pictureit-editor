import { fabric } from "fabric"

declare module "fabric" {
  namespace fabric {
    interface IUtil {
      loadImage(
        url: string,
        options?: {
          signal?: AbortSignal
          crossOrigin?: "" | "anonymous" | "use-credentials" | null
        }
      ): Promise<HTMLImageElement>
      enlivenObjects(objects: any[]): Promise<fabric.Object[]>
    }
    interface IEvent {
      deselected?: fabric.Object[] | undefined
    }
    interface IObjectOptions {
      erasable?: boolean
    }
    interface IGroupOptions {
      erasable?: boolean | "deep"
    }
    interface Object {
      fromObject(object: any): Promise<this>
      eraser?: fabric.Eraser
    }
    interface ActiveSelection {
      enterGroup(object: fabric.Object): boolean
      exitGroup(object: fabric.Object): void
      removeAll(): fabric.Object[]
    }
    class Eraser extends Group {
      static fromObject(object: any): Promise<Eraser>
    }
  }
}
