import {AbstractUnit} from './abstractUnit';
import { InteractiveObject } from './interactiveObject';
import { WeaponDog } from './weaponDog';
export class DogUnit extends AbstractUnit{
  weapon: WeaponDog;
  constructor(){
    super();
    this.weapon = new WeaponDog();
    this.weapon.onBulletTarget = (point)=>{
      this.onDamageTile?.(point);
    }
  }

  addGold(amount: number): boolean {
    return false;
  }
  getDamage(target: InteractiveObject) {
    return 5;    
  }
}