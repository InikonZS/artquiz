import { ITechBuild } from "./iTechBuild";
import { MapObject } from "./mapObject";

export interface IBuildConstructor{
  new (build:ITechBuild, res:Record<string, HTMLImageElement>):MapObject
}