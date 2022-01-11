import {AbstractUnit} from './abstractUnit';
import { InteractiveObject } from './interactiveObject';
import { WeaponSolder } from './weaponSolder';
export class SolderUnit extends AbstractUnit{
  weapon: WeaponSolder;
  constructor(){
    super();
    this.weapon = new WeaponSolder();
    this.weapon.onBulletTarget = (point)=>{
      this.onDamageTile?.(point);
    }
  }

  addGold(amount: number): boolean {
    return false;
  }
  getDamage(target: InteractiveObject) {
    return 10;    
  }
}