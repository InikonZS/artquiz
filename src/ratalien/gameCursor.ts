import { Vector } from "../common/vector";
import { InteractiveObject, ITechBuild } from "./interactives";

export class GameCursorStatus{
  pixelPosition:Vector = new Vector(0, 0);
  tilePosition:Vector = new Vector(0, 0);
  multiStart:Vector;
  selected:Array<InteractiveObject> = [];
  hovered:Array<InteractiveObject> = [];
  planned: ITechBuild;

  constructor(){

  }

  getAction(){
    let action:string = 'select';
    if (this.planned){
      action = 'build';
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
        //primary
      }
    }
    return action;
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

  renderMulti(ctx: CanvasRenderingContext2D){
    ctx.fillStyle = '#fff4';
    ctx.fillRect(this.multiStart.x, this.multiStart.y, this.pixelPosition.x -this.multiStart.x, this.pixelPosition.y -this.multiStart.y);
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