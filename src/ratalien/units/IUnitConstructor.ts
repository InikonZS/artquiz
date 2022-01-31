import { AbstractUnit } from "./abstractUnit";
import {TilesCollection} from "../TileElement";

export interface IUnitConstructor{
  new (tilesCollection:TilesCollection):AbstractUnit
}
