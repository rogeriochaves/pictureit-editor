import { fabric } from "fabric"

declare module "fabric" {
  namespace fabric {
    //@ts-ignore
    interface IUtil extends fabric.IUtil {
      loadImage(url: string): Promise<HTMLImageElement>
    }
    //@ts-ignore
    interface IEvent extends fabric.IEvent {
      deselected?: fabric.Object[] | undefined;
    }
  }
}
