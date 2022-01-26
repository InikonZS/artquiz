import { findClosestBuild, findClosestUnit, getTilingDistance } from '../distance';
import { Vector, IVector } from "../../common/vector";
import { InteractiveObject } from "./interactiveObject";
import {consts} from "../globals";
import AbstractWeapon from "./abstractWeapon";
import { MapObject } from './mapObject';
import { GamePlayer } from '../gamePlayer';

export class AbstractUnit extends InteractiveObject{
  positionPx: Vector;
  target: Vector = null;
  speed: number = 8.5;
  name:string;
  attackTarget: Vector;
  player:GamePlayer;
  time: number= 0;
  path: Vector[];
  health: number = 100;
  tileChecker: (pos: Vector) => boolean;
  type:string = 'unit';
  onDamageTile: (point: Vector) => void;
 // getResource: () => InteractiveObject[];
 // getObjects: () => InteractiveObject[];
  setTarget: (point: Vector) => void;
  //getObjectInTile: (point: Vector) => InteractiveObject;
  protected gold: number = 0;
  maxGold: number = 3000;
  weapon: AbstractWeapon;
   targetEnemy: { distance: number; unit: AbstractUnit; } | { distance: number; unit: MapObject; tile: Vector; };

  get position() {
    return new Vector(Math.floor(this.positionPx.x/55), Math.floor(this.positionPx.y / 55));
  }

  constructor(){
    super();
    // this.weapon = new Weapon();
    // this.weapon.onBulletTarget = (point)=>{
    //   this.onDamageTile?.(point);
    // }
  }

  inShape(tile:Vector, cursor:Vector){
    let pos = cursor.clone().sub(new Vector(this.positionPx.x, this.positionPx.y));
    if (pos.abs()<15){
      return true;
    }
    return false;
  }

  render(ctx:CanvasRenderingContext2D, camera:Vector,delta:number, size:number, selected:boolean){
    const sz = 10;
    ctx.fillStyle = this.isHovered?"#9999":consts.colors[this.player.colorIndex];
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(camera.x + this.positionPx.x, camera.y+ this.positionPx.y, sz, sz, 0, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.fillText(this.name, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-10);
    // ctx.fillText(`health: ${this.health}`, camera.x + this.positionPx.x, camera.y + this.positionPx.y - 20);
    // Прогресс-баз состояния здоровья Юнита
    ctx.strokeStyle = '#666'
    ctx.strokeRect(camera.x + this.positionPx.x,camera.y + this.positionPx.y - 20, 100, 10);
    ctx.fillStyle = '#ccc'
    ctx.fillRect(camera.x + this.positionPx.x, camera.y + this.positionPx.y - 20, 100, 10);
    ctx.fillStyle = 'blue';
    ctx.fillRect(camera.x + this.positionPx.x, camera.y + this.positionPx.y - 20, this.health, 10);
    
    if (selected){
      ctx.fillText(`selected`, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-30);  
    }

    if (this.gold){
      ctx.fillText(`gold: ${this.gold} / ${this.maxGold}`, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-40);  
    }

    this.weapon.render(ctx, camera);
    this.step(delta);
  }

  addGold(amount:number){
    if (this.gold == this.maxGold){
      return false;
    }
    this.gold += amount;
    if(this.gold>this.maxGold){
      this.gold = this.maxGold;
    }
    return true;
  }

  getGold(){
    return this.gold;
  }

  clearGold(){
    if (this.gold == 0){
      return false;
    }
    this.gold = 0;
    return true;
  }

  step(delta:number){
    const sz = 55;
    if (this.target && this.tileChecker && !this.tileChecker(new Vector(Math.floor(this.target.x / sz), Math.floor(this.target.y / sz)))){
      return;
    }
    if (this.target){
      const speed = this.speed;
      this.positionPx = this.positionPx.clone().add(this.target.clone().sub(this.positionPx).normalize().scale(speed));
      if (this.positionPx.clone().sub(this.target).abs()<=speed){
        this.positionPx = this.target.clone();
        if (this.path && this.path.length){
          this.target = this.path.pop().clone().scale(sz);
        }
      }
    }else {
      if (this.path && this.path.length){
        this.target = this.path.pop().clone().scale(sz);
      }
    }

    if (this.attackTarget){
      if (this.shot()){
        this.target = null;
        this.path = null;
      };
    }
    this.weapon.step(delta);
    this.weapon.position = this.position.clone();
  } 

  setPath(path:Array<Vector>, tileChecker:(pos:Vector)=>boolean, attackPoint:Vector = null){
    this.attackTarget = attackPoint
    const sz =55;
    this.path = [...path].reverse();
    this.target = this.path.pop()?.clone().scale(sz);
    this.tileChecker = tileChecker;
  }

  shot(){
    return this.weapon.tryShot(this.attackTarget);
  }

  getAction(hovered: InteractiveObject, mapTile?:number) {
    let action = 'move';
    if (hovered && hovered.player!=this.player){
      action = 'attack';
    } else {
      action = 'move';
    }
    return action;
  }

  logic() {
   const units = this.getList().list.filter(it=> it instanceof AbstractUnit&&it.player!=this.player) as AbstractUnit[];
   const builds =this.getList().list.filter(it=> it instanceof MapObject&&it.player!=this.player) as MapObject[];
    const closestUnit = findClosestUnit(this.position.clone(), units);
    const closestBuild = findClosestBuild(this.position.clone(), builds);
    const targetEnemy = closestUnit.distance > closestBuild.distance ? closestBuild : closestUnit;
   
    if (!this.attackTarget) {
      this.targetEnemy = targetEnemy;
      if (this.targetEnemy.unit instanceof MapObject) {
        this.setTarget(closestBuild.tile)
      } else if(this.targetEnemy.unit instanceof AbstractUnit){
        this.setTarget(closestUnit.unit.position);
      }
    } else if(this.targetEnemy.unit.health ===0) {
      this.attackTarget = null;
    }
  }

  findClosestEnemy() {
    const units = this.getList().list.filter(it=> it instanceof AbstractUnit&&it.player!=this.player) as AbstractUnit[];
   const builds =this.getList().list.filter(it=> it instanceof MapObject&&it.player!=this.player) as MapObject[];
    const closestUnit = findClosestUnit(this.position.clone(), units);
    const closestBuild = findClosestBuild(this.position.clone(), builds);
    return closestUnit.distance > closestBuild.distance ? closestBuild : closestUnit;
  }
  
  damage(point: Vector, tile: Vector, unit: InteractiveObject) {
 //(unit as AbstractUnit).weapon.getDamage()
    const amount = 10;
    const {distance} = getTilingDistance(tile, this.position,[[1]]);
    if (distance === 0) {
      this.health -=amount;
      if (this.health<=0){
        this.onDestroyed();
      }
    }    
  }
  
}