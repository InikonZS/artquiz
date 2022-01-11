import { InteractiveObject } from './interactiveObject';
import { MapObject } from './mapObject';
import { AbstractUnit } from './abstractUnit';
import {WeaponTrack} from './weaponTrack';

export class TruckUnit extends AbstractUnit{
  weapon: WeaponTrack;
  constructor(){
    super();
    this.weapon = new WeaponTrack();
    this.weapon.onBulletTarget = (point)=>{
      this.onDamageTile?.(point);
    }
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