import {Vector, IVector} from "../../common/vector";
import {Bullet} from "./bullet";
import AbstractWeapon from './abstractWeapon';

export class WeaponDog extends AbstractWeapon {
  
  constructor() {
    super(Bullet, 100, 400);
  }
}