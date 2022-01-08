import { IVector, Vector } from "../common/vector";
import { InteractiveObject, ITechBuild, MapObject, UnitObject } from "./interactives";
import {checkMap} from "./distance";

export class GameCursorStatus{
  pixelPosition:Vector = new Vector(0, 0);
  tilePosition:Vector = new Vector(0, 0);
  multiStart:Vector;
  selected:Array<InteractiveObject> = [];
  hovered:Array<InteractiveObject> = [];
  planned: ITechBuild;
  getPrimaries: () => Record<string, MapObject>;
  getMap: () => Array<Array<number>>;

  constructor(getPrimaries:()=>Record<string, MapObject>, getMap:()=>Array<Array<number>>){
    this.getPrimaries = getPrimaries;
    this.getMap = getMap;
  }

  getAction(){
    let action:string = 'select';
    if (this.planned){
      const mask = checkMap(this.getMap(), this.planned.mtx.map(it=>it.map(jt=>Number.parseInt(jt))), this.tilePosition);
      
      if (mask.flat(1).find(it=>it!=0) == null){
        action = 'build';
      } else {
        action = 'no_build';
      }
    } else if (this.selected.length == 0){
      //no selected
      action = 'select';
    } else if (this.selected.find(it=>!(it instanceof UnitObject))== null){
      //selected only units
      action = 'move';
      if (this.hovered[0] && this.hovered[0].player!=0){
        action = 'attack';
      } else {
        action = 'move';
      }
    } else if ((this.selected[0] instanceof MapObject)) {
      if (this.hovered[0] == this.selected[0]){
        if (this.getPrimaries()[this.hovered[0].name] ==this.hovered[0]){
          action = 'no'
        } else {
          action = 'primary'
        }
      }
    }
    return action;
  }

  isOnlyUnitsSelected(){
    return this.selected.find(it=> !(it instanceof UnitObject)) == null
  }

  render(ctx:CanvasRenderingContext2D, camera:Vector){
    this.renderCursor(ctx, camera)
    if (this.multiStart){
      this.renderMulti(ctx, camera);
    }
    if (this.planned){
      this.renderBuildPlanned(ctx, camera);
    }
  }

  renderCursor(ctx:CanvasRenderingContext2D, camera:Vector){
    ctx.fillStyle = "#00f";
    ctx.beginPath();
    let r =2;
    ctx.ellipse(this.pixelPosition.x -r, this.pixelPosition.y-r, r*2, r*2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke(); 
    // 
    let label = 'ground';
    if (this.hovered[0]){
       label = this.hovered[0].type +': '+this.hovered[0].name;
    }
    ctx.fillText( label , this.pixelPosition.x, this.pixelPosition.y -10);

    ctx.fillText( this.getAction() , this.pixelPosition.x, this.pixelPosition.y -20);
    this.drawTile(ctx, this.tilePosition, camera, "#0ff7", 55);
  }

  renderMulti(ctx: CanvasRenderingContext2D, camera:Vector){
    ctx.fillStyle = '#fff4';
    ctx.fillRect(this.multiStart.x+camera.x, this.multiStart.y+camera.y, this.pixelPosition.x -this.multiStart.x-camera.x, this.pixelPosition.y -this.multiStart.y-camera.y);
  }

  renderBuildPlanned(ctx: CanvasRenderingContext2D, camera:Vector){
    //const cursorTile = this.getTileCursor();
    //this.currentBuilding.render();
    const mask = checkMap(this.getMap(), this.planned.mtx.map(it=>it.map(jt=>Number.parseInt(jt))), this.tilePosition);
    this.drawObject(ctx, this.planned.mtx, this.tilePosition, camera, "#ff06", 55);
    this.drawObject(ctx, /*this.planned.mtx*/mask.map(it=>it.map(jt=>jt.toString())), this.tilePosition, camera, "#f00", 55);
  }

  drawObject(ctx:CanvasRenderingContext2D, object:Array<Array<any>>, position:IVector, camera:IVector, color:string, sz:number){
    object.forEach((row, i)=>row.forEach((cell, j)=>{
      if (object[i][j]!='0'){
        this.drawTile(ctx, new Vector(j+position.x, i+position.y), camera, color, sz);
      }
    }));
  }

  drawTile(ctx:CanvasRenderingContext2D, position:IVector, camera:IVector, color:string, sz:number){
    //const sz = this.sz;
    ctx.fillStyle = color;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(camera.x + position.x * sz, camera.y+ position.y *sz, sz, sz);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}