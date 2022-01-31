import {AbstractUnit} from './abstractUnit';
import { InteractiveObject } from './interactiveObject';
import { WeaponHeavyTank } from './weaponHeavyTank';
import {TilesCollection} from "../TileElement";
export class HeavyTankUnit extends AbstractUnit{
  weapon: WeaponHeavyTank;
  constructor(tilesCollection:TilesCollection){
    super(tilesCollection);
    this.weapon = new WeaponHeavyTank();
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