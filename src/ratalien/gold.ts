import { InteractiveObject } from './units/interactiveObject';
import { Vector } from "../common/vector";
import { TruckUnit } from './units/TruckUnit';

export class Gold extends InteractiveObject{
  _position: Vector;
  name = 'gold';
  gold: number = 1000;
  goldFull: HTMLImageElement;
  goldLow: HTMLImageElement;
  goldMed: HTMLImageElement;
  goldMin: HTMLImageElement;
  get position(){
    return this._position;
  }
  set position(val:Vector){
    this._position = val;
  }
  constructor(pos: Vector) {
    super();
    this.position = pos;
  }

  render(ctx: CanvasRenderingContext2D, camera: Vector,  ...props: any): void {
    let img = this.goldFull;
    if (this.gold === 800) {
      img = this.goldMed;
    } else if (this.gold == 600) {
      img = this.goldLow;
    } else if( this.gold <= 400){
      img = this.goldMin;
    }
    ctx.drawImage(img, camera.x + this.position.x *55, camera.y + this.position.y * 55, 55, 55);
    const miniCtx = props[props.length - 1];
    //console.log('mini', miniCtx)
    miniCtx.fillStyle = '#f00';
    miniCtx.fillRect(this.position.x*2, this.position.y*2, 2, 2);

    //this.position.x + 0 + j * sz, this.position.y + 0 + i * sz - (this.res['goldFull'].naturalHeight - 128), sz, sz * this.res['goldFull'].naturalHeight / 128);
    //this.drawTile(ctx, this.position, camera, '#ff0', 55);
  }

   drawTile(ctx:CanvasRenderingContext2D, position:Vector, camera:Vector, color:string, size:number){
    const sz = size;//55;//this.sz;
    ctx.fillStyle = color;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(camera.x + position.x * sz, camera.y+ position.y *sz, sz, sz);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  inShape(tile: Vector, cursor: Vector) {
    const distance = tile.clone().sub(this.position).abs();
    if (distance===0) {
      return true;
    }
    return false;
  }

  damage(point: Vector, tile: Vector, unit: InteractiveObject) {
   const distance = tile.clone().sub(this.position).abs();
    if (distance === 0 && unit.name === 'truck') {
      if ((unit as TruckUnit).addGold(200)) {
         this.gold -= 200;
        if (this.gold <= 0) {
          this.onDestroyed();
        }
      }     
    }
  }

  addResources(goldFull: HTMLImageElement,goldLow: HTMLImageElement,goldMed: HTMLImageElement,goldMin: HTMLImageElement) {
    this.goldFull = goldFull;
    this.goldLow = goldLow;
    this.goldMed = goldMed;
    this.goldMin = goldMin;
  }
}