import {Vector, IVector} from "../../common/vector";
import {Bullet} from "./bullet";
import AbstractWeapon from './abstractWeapon';

export class WeaponTank extends AbstractWeapon {
  
  constructor() {
    super(Bullet, 400, 400);
  }
}