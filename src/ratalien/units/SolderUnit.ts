import { Vector } from '../../common/vector';
import { findClosestBuild, findClosestUnit } from '../distance';
import {AbstractUnit} from './abstractUnit';
import { InteractiveObject } from './interactiveObject';
import { MapObject } from './mapObject';
import { WeaponSolder } from './weaponSolder';
import {TilesCollection} from "../TileElement";
export class SolderUnit extends AbstractUnit{
  weapon: WeaponSolder;
 
  constructor(tilesCollection:TilesCollection){
    super(tilesCollection);
    this.weapon = new WeaponSolder();
    this.weapon.onBulletTarget = (point)=>{
      this.onDamageTile?.(point);
      const newEnemy = this.findClosestEnemy();
      if (newEnemy !== this.targetEnemy) {
        this.attackTarget = null;
      }
    }
  }

  step(delta: number) {
    super.step(delta);
    this.logic();
  }

  addGold(amount: number): boolean {
    return false;
  }
  getDamage(target: InteractiveObject) {
    return 10;    
  }

  


}