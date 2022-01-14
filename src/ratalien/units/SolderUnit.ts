import { findClosestBuild, findClosestUnit } from '../distance';
import {AbstractUnit} from './abstractUnit';
import { InteractiveObject } from './interactiveObject';
import { MapObject } from './mapObject';
import { WeaponSolder } from './weaponSolder';
export class SolderUnit extends AbstractUnit{
  weapon: WeaponSolder;
  targetEnemy: { distance: number; unit: AbstractUnit; } | { distance: number; unit: MapObject; tile: import("c:/Users/админ/Desktop/rs/rs-clone2/artquiz/src/common/vector").Vector; };
  constructor(){
    super();
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

  logic() {
    const closestUnit = findClosestUnit(this.position.clone(), this.getResource().filter(it => it instanceof AbstractUnit) as AbstractUnit[]);
    const closestBuild = findClosestBuild(this.position.clone(), this.getResource().filter(it => it instanceof MapObject) as MapObject[]);
    const targetEnemy = closestUnit.distance > closestBuild.distance ? closestBuild : closestUnit;
   
    if (!this.attackTarget) {
      this.targetEnemy = targetEnemy;
      if (this.targetEnemy.unit instanceof MapObject) {
        this.setTarget(closestBuild.tile)
      } else {
        this.setTarget(closestUnit.unit.position);
      }
    } else if(this.targetEnemy.unit.health ===0) {
      this.attackTarget = null;
    }
  }

  findClosestEnemy() {
    const closestUnit = findClosestUnit(this.position.clone(), this.getResource().filter(it => it instanceof AbstractUnit) as AbstractUnit[]);
    const closestBuild = findClosestBuild(this.position.clone(), this.getResource().filter(it => it instanceof MapObject) as MapObject[]);
    return closestUnit.distance > closestBuild.distance ? closestBuild : closestUnit;
  }


}