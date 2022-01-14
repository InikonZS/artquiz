import {AbstractUnit} from './abstractUnit';
import { InteractiveObject } from './interactiveObject';
import { WeaponBomber } from './weaponBomber';
export class BomberUnit extends AbstractUnit{
  weapon: WeaponBomber;
  constructor(){
    super();
    this.weapon = new WeaponBomber();
    this.weapon.onBulletTarget = (point)=>{
      this.onDamageTile?.(point);
    }
  }

  addGold(amount: number): boolean {
    return false;
  }
  getDamage(target: InteractiveObject) {
    return 30;    
  }
}