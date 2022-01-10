import {Vector, IVector} from "../../common/vector";
import { onLine } from "./lineUtils";

export class Bullet{
  target: Vector;
  position: Vector;
  speed:number = 1;
  onTarget:()=>void;
  isDestroyed: boolean = false;

  constructor(target:Vector, position:Vector){
    this.target = target;
    this.position = position;
  }

  step(delta:number){
    if (this.isDestroyed) return;

    const next = this.position.clone().add(this.position.clone().sub(this.target).normalize().scale(-this.speed*delta));
    if (onLine(this.target, this.position, next)){
      this.onTarget?.();
      this.isDestroyed = true;
    } else {
      this.position = next;
    }
  }

  render(ctx:CanvasRenderingContext2D, camera:Vector){
    if (this.isDestroyed) return;

    const sz = 5;
    ctx.fillStyle = "#0ff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(camera.x + this.position.x + sz/2, camera.y + this.position.y + sz/2, sz, sz, 0, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}