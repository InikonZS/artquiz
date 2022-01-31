import {AbstractUnit} from './abstractUnit';
import { InteractiveObject } from './interactiveObject';
import { WeaponTank } from './weaponTank';
import {TilesCollection} from "../TileElement";
export class TankUnit extends AbstractUnit{
  weapon: WeaponTank;
  constructor(tilesCollection:TilesCollection){
    super(tilesCollection);
    this.weapon = new WeaponTank();
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
    return 20;    
  }
}