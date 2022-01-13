import AbstractWeapon from './abstractWeapon';
import {Bullet} from "./bullet";
export class WeaponTrack extends AbstractWeapon{
  constructor() {
    super(Bullet, 100, 400);
  }
}