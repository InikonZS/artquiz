import { InteractiveObject } from './units/interactiveObject';
import { Vector } from "../common/vector";

export class Gold extends InteractiveObject{
  _position: Vector;
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

  render(ctx: CanvasRenderingContext2D, camera: Vector, ...props: any): void {
    this.drawTile(ctx, this.position, camera, '#ff0', 55);
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
}