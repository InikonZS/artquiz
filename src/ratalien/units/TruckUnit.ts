import { InteractiveObject } from './interactiveObject';
import { MapObject } from './mapObject';
import { AbstractUnit } from './abstractUnit';
import {WeaponTrack} from './weaponTrack';
import { Gold } from '../gold';
import { OreFactory } from './oreFactory';

export class TruckUnit extends AbstractUnit{
  weapon: WeaponTrack;
  
  constructor(){
    super();
    this.weapon = new WeaponTrack();
    this.weapon.onBulletTarget = (point)=>{
      this.onDamageTile?.(point);
    }
  }

  step(delta: number) {
    super.step(delta);
    this.logic();
  }

  getAction(hovered: InteractiveObject, mapTile?: number) {
    let action = 'move';
        if (hovered instanceof Gold ){
          action = 'gold';
        } else if (hovered instanceof OreFactory && hovered?.player == 0){
          action = 'cash_in'
        }
      
    return action;
  }
  
  getDamage(target: InteractiveObject) {
    return 0;    
  }

  logic() {
    //this.target
    //this.path
    //this.attackTarget
    // this.setPath()
  }
}
