import {AbstractUnit} from './abstractUnit';
import { InteractiveObject } from './interactiveObject';
import { WeaponDog } from './weaponDog';
import {TilesCollection} from "../TileElement";
export class DogUnit extends AbstractUnit{
  weapon: WeaponDog;
  constructor(tilesCollection:TilesCollection){
    super(tilesCollection);
    this.weapon = new WeaponDog();
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
    return 5;    
  }
}