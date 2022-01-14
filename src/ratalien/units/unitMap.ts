import { BomberUnit } from "./BomberUnit";
import { DogUnit } from "./dogUnit";
import { HeavyTankUnit } from "./HeavyTankUnit";
import { IUnitConstructor } from "./IUnitConstructor";
import { SolderUnit } from "./SolderUnit";
import { TankUnit } from "./TankUnit";
import { TruckUnit } from "./TruckUnit";

export const units:Record<string, IUnitConstructor> = {
  'solder': SolderUnit, 
  'truck': TruckUnit,
  'tank': TankUnit,
  'heavyTank': HeavyTankUnit,
  'dog': DogUnit,
  'bomber': BomberUnit,
};