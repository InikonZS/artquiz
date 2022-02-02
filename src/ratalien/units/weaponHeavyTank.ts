import {Vector, IVector} from "../../common/vector";
import {Bullet} from "./bullet";
import AbstractWeapon from './abstractWeapon';

export class WeaponHeavyTank extends AbstractWeapon {
  
  constructor() {
    super(Bullet, 500, 400);
  }
}