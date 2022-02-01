import {Vector, IVector} from "../../common/vector";
import { AbstractUnit } from "./abstractUnit";
import { InteractiveObject } from './interactiveObject';
import {consts} from "../globals";
import {WeaponSolder} from "./weaponSolder";

export class UnitObject1 extends AbstractUnit{
  positionPx: Vector;//{x:number, y:number};
  target: Vector = null;
  speed: number = 8.5;
  //attackRadius: number = 300;
  name:string;
  attackTarget: Vector;//{damage:(amount:number)=>void, position:IVector} = null;
  player:number;
  time: number= 0;
  //private _stepIndex: number;
  path: Vector[];//IPathPoint[]; 
  health: number = 100;
  tileChecker: (pos: Vector) => boolean;
  type:string = 'unit';
  //bullet: Vector;
  //reloadTime: number = 0;
  onDamageTile:(point:Vector)=>void;
  //protected gold: number = 0;
  maxGold: number = 3000;
  weapon: WeaponSolder;

  get position(){
    return new Vector(Math.floor(this.positionPx.x/55), Math.floor(this.positionPx.y / 55));
  }

  constructor(){
    super();
    //this._stepIndex = 1
    this.weapon = new WeaponSolder();
    //this.weapon.reloadTime = 140;
    this.weapon.onBulletTarget = (point)=>{
      this.onDamageTile?.(point);
    }
    //this.weapon.position = this.position.clone();
  }

  inShape(tile:Vector, cursor:Vector){
    let pos = cursor.clone().sub(new Vector(this.positionPx.x, this.positionPx.y));
    if (pos.abs()<15){
      return true;
    }
    return false;
  }

  // step(delta:number,traceMap: TraceMap){
  //       //fix logic atack and move

  //   this.time -= delta;
  //   const stepIndex = Math.floor(this._stepIndex);
  //   if (this.target) {
  //     //TODO check Tile quarter-> offset insideTile
  //     if (!this.path){
  //       this.path = traceMap.getPath()
  //     }
  //     const path = this.path;

  //     if (path && stepIndex < path.length) {
  //       const pathVector = new Vector(path[stepIndex].x * 55+55/2, path[stepIndex].y * 55+55/2)
  //       /*this.position = pathVector.clone()
  //         .add(pathVector
  //           .sub(this.target).normalize().scale(-this.speed));*/
  //           this.position = new Vector(this.position.x, this.position.y).add(new Vector(this.position.x, this.position.y).sub(pathVector).normalize().scale(-this.speed));
         

  //       if (new Vector(this.position.x, this.position.y).sub(this.target).abs() < 5) {
  //         this.target = null;
  //         this.path = null;
  //       }
        
  //       //this._stepIndex+=0.1;
  //       //теперь он ходит плавно
  //       if (new Vector(this.position.x, this.position.y).sub(pathVector).abs()<this.speed*2){
  //         this.position = pathVector.clone()/*
  //         .add(pathVector
  //           .sub(this.target).normalize().scale(-this.speed));*/
  //           this._stepIndex+=1;
  //           //this.path = traceMap.getPath();
  //       }
  //     }else if(path && stepIndex == path.length){
  //     }
  //   }
  //   // if (this.target){
  //   //   this.position = new Vector(this.position.x, this.position.y).add(new Vector(this.position.x, this.position.y).sub(this.target).normalize().scale(-this.speed));
  //   //   if (new Vector(this.position.x, this.position.y).sub(this.target).abs()<5){
  //   //     this.target = null;
  //   //   }
  //   // }
  //   else {
      
  //     this.attack(delta);
  //   }
  // }
/*clearStepIndex(){
    console.log("index",this._stepIndex)
  this._stepIndex=1;
  this.path = null;
}*/
 /* attack(delta:number){
    //fix logic atack and move
    if (this.attackTarget){
     // console.log('atack');
      if (Vector.fromIVector(this.attackTarget.position).scale(55).sub(Vector.fromIVector(this.position)).abs()< this.attackRadius ){
        this.target = null;
        if (this.time<=0){
          this.time = 500;
          this.attackTarget.damage(1);
        }
      } else {
        this.target = Vector.fromIVector(this.attackTarget.position).scale(55);
      }
    }
  }*/

  render(ctx:CanvasRenderingContext2D, camera:Vector,delta:number, size:number, selected:boolean){
    const sz = 10;
    ctx.fillStyle = this.isHovered?"#9999":consts.colors[this.player];
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(camera.x + this.positionPx.x /*+ (55-10)/2*/, camera.y+ this.positionPx.y /*+ (55-10)/2*/, sz, sz, 0, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.fillText(this.name, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-10);
    ctx.fillText(`health: ${this.health}`, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-20);
    if (selected){
      ctx.fillText(`selected`, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-30);  
    }

    if (this.gold){
      ctx.fillText(`gold: ${this.gold} / ${this.maxGold}`, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-40);  
    }

    /*if (this.bullet && this.attackTarget){
      this.bullet.sub(this.bullet.clone().sub(this.attackTarget).normalize().scale(6));
      if (this.bullet.clone().sub(this.attackTarget).abs()<20){
        this.bullet = null;
        this.onDamageTile?.();
        return;
      }
      this.renderBullet(ctx, camera);
    }*/
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
    //this.reloadTime--;
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

    /*if (this.attackTarget){
      let dist = this.attackTarget.clone().sub(this.positionPx).abs();
      if (dist < this.attackRadius){
        this.target = null;
        this.path = null;
        this.shot();
      }
    }*/
    if (this.attackTarget){
     /* let dist = this.attackTarget.clone().sub(this.positionPx).abs();
      if (dist < this.weapon.attackRadius){
        this.target = null;
        this.path = null;
      }*/
      if (this.shot()){
        this.target = null;
        this.path = null;
      };
    }
    this.weapon.step(delta);
    this.weapon.position = this.position.clone();
  } 

  setPath(path:Array<Vector>, tileChecker:(pos:Vector)=>boolean, attackPoint:Vector = null){
    console.log('set Path',path,tileChecker)
    this.attackTarget = attackPoint
    const sz =55;
    console.log('sp ', path);
    this.path = [...path].reverse();
    this.target = this.path.pop().clone().scale(sz);
    this.tileChecker = tileChecker;
  }

  /*renderBullet(ctx:CanvasRenderingContext2D, camera:Vector){
    const sz = 2;
    ctx.fillStyle = "#0ff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(camera.x+5 + this.bullet.x, camera.y+ this.bullet.y+5, sz, sz, 0, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }*/

  shot(){
    return this.weapon.tryShot(this.attackTarget);
    /*if (this.reloadTime<=0){
      this.bullet = this.positionPx.clone();
      this.reloadTime = 50;
    }*/
  }

  getAction(hovered: InteractiveObject, mapTile?:number) {
     let action = 'move';
      // if (this.selected.find(it=>it.name =='solder') && (this.getRealMap()[this.tilePosition.y][this.tilePosition.x] == 1)|| (this.hovered instanceof MapObject && this.hovered?.player == 0)){
      //   if (this.getRealMap()[this.tilePosition.y][this.tilePosition.x] == 1){
      //     action = 'gold';
      //   } else if (hovered instanceof MapObject && hovered.name == 'barracs'){
      //     action = 'cash_in'
      //   }
      // } else {
        if (hovered && hovered.player!=0){
          action = 'attack';
        } else {
          action = 'move';
        }
      //}
    return action;
  }
}