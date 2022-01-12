import { IBuildConstructor } from "./IBuildConstructor";
import { Tower } from "./tower";
import { OreFactory } from "./oreFactory";

export const buildMap:Record<string, IBuildConstructor> = {
  'tower': Tower, 
  'oreFactory': OreFactory
};