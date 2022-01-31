import {AbstractUnit} from './abstractUnit';
import { InteractiveObject } from './interactiveObject';
import { WeaponBomber } from './weaponBomber';
import {TilesCollection} from "../TileElement";
export class BomberUnit extends AbstractUnit{
  weapon: WeaponBomber;
  constructor(tilesCollection:TilesCollection){
    super(tilesCollection);
    this.weapon = new WeaponBomber();
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
    return 30;    
  }
}