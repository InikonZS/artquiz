import { IUnitConstructor } from "./IUnitConstructor";
import { SolderUnit } from "./SolderUnit";
import { TruckUnit } from "./TruckUnit";

export const units:Record<string, IUnitConstructor> = {
  'solder': SolderUnit, 
  'truck': TruckUnit
};