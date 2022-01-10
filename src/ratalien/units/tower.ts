import {Vector, IVector} from "../../common/vector";
import { findClosestUnit } from "../distance";
import { ITechBuild } from "./iTechBuild";
import { MapObject } from "./mapObject";
import { UnitObject } from "./unitObject";
import { Weapon } from "./weapon";

export class Tower extends MapObject{
  weapon: Weapon = new Weapon();
  getUnits: ()=>UnitObject[];
  
  constructor(build:ITechBuild, res:Record<string, HTMLImageElement>){
    super(build, res);
    this.weapon = new Weapon();
    
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

  logic(enemies:UnitObject[]){
    const near = findClosestUnit(this.position.clone().scale(55), enemies);
    if (near.unit){
      this.attack(near.unit.positionPx);
    }
  }

  attack(target:Vector){
    this.weapon.tryShot(target);
  }
}