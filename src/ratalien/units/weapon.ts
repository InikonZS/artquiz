import {Vector, IVector} from "../../common/vector";
import {Bullet} from "./bullet";
import AbstractWeapon from './abstractWeapon';

export class Weapon extends AbstractWeapon {
  
  constructor() {
    super(Bullet, 300, 400);
  }
}