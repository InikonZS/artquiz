import { InteractiveObject } from './interactiveObject';
import { MapObject } from './mapObject';
import { AbstractUnit } from './abstractUnit';
import {WeaponTrack} from './weaponTrack';
import { Gold } from '../gold';
import { OreFactory } from './oreFactory';
import { findClosestBuild, findClosestGold } from '../distance';

export class TruckUnit extends AbstractUnit{
  weapon: WeaponTrack;
  closestGold: InteractiveObject;
 // getResource: () => InteractiveObject[];
  constructor(){
    super();
    this.weapon = new WeaponTrack();
    this.weapon.onBulletTarget = (point)=>{
      this.onDamageTile?.(point);
      const newClosestGold =  findClosestGold(this.position.clone(),  this.getResource());
      if (newClosestGold !== this.closestGold) {
        this.attackTarget = null;
      }
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
    if (this.gold >= 3000) {
      const closestBuild = findClosestBuild(this.position.clone(), this.getObjects().filter(item=>item.name == 'oreFactory'&&this.player===item.player) as MapObject[]);
      //console.log(closestBuild.tile)
      if (closestBuild.tile) {
        this.setTarget(closestBuild.tile);
      }
      
    }else if (!this.attackTarget) {
      this.closestGold = findClosestGold(this.position.clone(), this.getResource());
     //console.log(this.closestGold.position)
      this.setTarget(this.closestGold.position);
    }
  }
}