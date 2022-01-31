import { IVector, Vector } from "../common/vector";
import { InteractiveObject, ITechBuild, MapObject } from "./interactives";
import { checkMap, findClosestBuild } from "./distance";
import {AbstractUnit} from './units/abstractUnit'
import { InteractiveList } from "./interactiveList";
import { GamePlayer } from "./gamePlayer";

export class GameCursorStatus{
  pixelPosition:Vector = new Vector(0, 0);
  tilePosition:Vector = new Vector(0, 0);
  multiStart:Vector;
  selected:Array<InteractiveObject> = [];
  hovered:Array<InteractiveObject> = [];
  planned: ITechBuild;
  getPrimaries: () => Record<string, MapObject>;
  getMap: () => Array<Array<number>>;
  getRealMap: () => Array<Array<number>>;
  getObjects: () => InteractiveList;
  getCurrentPlayer: () => GamePlayer;

  constructor(getPrimaries:()=>Record<string, MapObject>, getMap:()=>Array<Array<number>>, getRealMap:()=>Array<Array<number>>){
    this.getPrimaries = getPrimaries;
    this.getMap = getMap;
    this.getRealMap = getRealMap;
  }

  getAction(){
    let action:string = 'select';
    if (this.planned){
      const mask = this.getBuildMask();
      if (mask.flat(1).find(it => it != 0) == null) {
        
        action = 'build';
      } else {
        action = 'no_build';
      }
    } else if (this.selected.length == 0) {
      //no selected
      action = 'select';
    } else if (this.selected.find(it => !(it instanceof AbstractUnit)) == null) {
      console.log('this.selected ',this.selected)
      console.log('this.selected.find ',this.selected.find(it => !(it instanceof AbstractUnit)))
      action = this.selected[0].getAction(this.hovered[0],this.getRealMap()[this.tilePosition.y][this.tilePosition.x] )

      //selected only units
      // action = 'move';
      // if (this.selected.find(it=>it.name =='solder') && (this.getRealMap()[this.tilePosition.y][this.tilePosition.x] == 1)|| (this.hovered[0] instanceof MapObject && this.hovered[0]?.player == 0)){
      //   if (this.getRealMap()[this.tilePosition.y][this.tilePosition.x] == 1){
      //     action = 'gold';
      //   } else if (this.hovered[0] instanceof MapObject && this.hovered[0].name == 'barracs'){
      //     action = 'cash_in'
      //   }
      // } else {
      //   if (this.hovered[0] && this.hovered[0].player!=0){
      //     action = 'attack';
      //   } else {
      //     action = 'move';
      //   }
      // }
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

  getBuildMask() {
    const mask = checkMap(this.getMap(), this.planned.mtx.map(it => it.map(jt => Number.parseInt(jt))), this.tilePosition);
    const redMask = this.planned.mtx.map(it => it.map(jt => Number.parseInt(jt)));
    const player = this.getCurrentPlayer();
    const builds = this.getObjects().list.filter(it => it.player === player&& it instanceof MapObject) as MapObject[];

    const closestBuild = findClosestBuild(this.tilePosition.clone(), builds);
    if (!(!builds.length || closestBuild.distance <= 6)) { 
      return redMask;
    }
    return mask;

    /* redMask массив вида
    [[0, 0, 0, 0]
     [1, 1, 0, 0]
     [1, 1, 1, 1]
     [1, 1, 1, 1]]

     mask - такой же массив, состоящий только из нулей
    */
  }

  isOnlyUnitsSelected(){
    return this.selected.find(it=> !(it instanceof AbstractUnit)) == null
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
    let num = this.getRealMap()[this.tilePosition.y][this.tilePosition.x];
    let label = 'ground '+num;
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
    const mask = this.getBuildMask();
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