import { fabric } from "fabric"

export class StaticPathObject extends fabric.Path {
  static type = "StaticPath"

  initialize(options: StaticPathOptions) {
    const { path, ...pathOptions } = options
    //@ts-ignore
    super.initialize(path, pathOptions)

    return this
  }
  toObject(propertiesToInclude = []) {
    return super.toObject(propertiesToInclude)
  }
  toJSON(propertiesToInclude = []) {
    return super.toObject(propertiesToInclude)
  }
}

fabric.StaticPath = fabric.util.createClass(StaticPathObject, {
  type: StaticPathObject.type,
})
fabric.StaticPath.fromObject = StaticPathObject.fromObject

export type StaticPathOptions = fabric.IPathOptions & { path: string }

declare module "fabric" {
  namespace fabric {
    class StaticPath extends StaticPathObject {
      constructor(options: StaticPathOptions)
    }
  }
}
