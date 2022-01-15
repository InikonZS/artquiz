import {AbstractUnit} from './abstractUnit';
import { InteractiveObject } from './interactiveObject';
import { WeaponTank } from './weaponTank';
export class TankUnit extends AbstractUnit{
  weapon: WeaponTank;
  constructor(){
    super();
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