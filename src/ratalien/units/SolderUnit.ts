import {UnitObject} from './unitObject';
import { InteractiveObject } from './interactiveObject';
export class SolderUnit extends UnitObject{
  constructor(){
    super();
  }

  addGold(amount: number): boolean {
    return false;
  }
  getDamage(target: InteractiveObject) {
    return 10;    
  }
}