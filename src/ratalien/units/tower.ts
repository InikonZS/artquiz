import {Vector, IVector} from "../../common/vector";
import { findClosestUnit } from "../distance";
import { ITechBuild } from "./iTechBuild";
import { MapObject } from "./mapObject";
import { AbstractUnit } from "./abstractUnit";
import { WeaponSolder } from "./weaponSolder";

export class Tower extends MapObject{
  weapon: WeaponSolder = new WeaponSolder();
  getUnits: ()=>AbstractUnit[];
  
  constructor(build:ITechBuild, res:Record<string, HTMLImageElement>){
    super(build, res);
    this.weapon = new WeaponSolder();
    
  }

  render(ctx:CanvasRenderingContext2D, camera:Vector, delta:number, size?:number, selected?:boolean, primary?:boolean){
    this.weapon.position = this.position;
    super.render(ctx, camera, delta, size, selected, primary);
    this.step(delta);
    this.weapon.render(ctx, camera);
    this.logic(this.getUnits());
  }

  step(delta:number){
    this.weapon.step(delta);
  }

  logic(enemies:AbstractUnit[]){
    const near = findClosestUnit(this.position.clone().scale(55), enemies);
    if (near.unit){
      this.attack(near.unit.positionPx);
    }
  }

  attack(target:Vector){
    this.weapon.tryShot(target);
  }
}