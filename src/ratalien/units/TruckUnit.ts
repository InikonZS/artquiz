import { InteractiveObject } from './interactiveObject';
import { MapObject } from './mapObject';
import {UnitObject} from './unitObject';

export class TruckUnit extends UnitObject{
  constructor(){
    super();
  }

 getAction(hovered: InteractiveObject, mapTile?:number) {
     let action = 'move';
      
        if (mapTile == 1){
          action = 'gold';
        } else if (hovered instanceof MapObject && hovered.name == 'barracs'&& hovered?.player == 0){
          action = 'cash_in'
        }
      
    return action;
  }
  
  getDamage(target: InteractiveObject) {
    return 0;    
  }
}