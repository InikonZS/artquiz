import { ITechBuild } from "./iTechBuild";
import { MapObject } from "./mapObject";

export class OreFactory extends MapObject{

  constructor(build:ITechBuild, res:Record<string, HTMLImageElement>){
    super(build, res);
  }
}