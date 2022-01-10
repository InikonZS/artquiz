import {Vector, IVector} from "../../common/vector";
import {Bullet} from "./bullet";

export class Weapon{
  attackRadius: number = 300;
  bullets: Array<Bullet> = [];
  reloadTime: number = 400;
  private loading: number = 0;
  position:Vector;
  onBulletTarget:(point:Vector)=>void;

  constructor(){

  }

  step(delta:number){
    this.loading -= delta;
    this.bullets.forEach(it=>it.step(delta));
  }

  render(ctx:CanvasRenderingContext2D, camera:Vector){
    this.bullets.forEach(it=>it.render(ctx, camera));
  }

  tryShot(target:Vector){
    if (!this.position) {console.log('no pos'); return;}
    if (this.loading<=0){
      
    }
    if (this.loading<=0 && target.clone().sub(this.position.clone().scale(55)).abs()<this.attackRadius){
      //console.log('radiused');
      this.shot(target);
    }
  }

  private shot(target:Vector){
    const bullet = new Bullet(target, this.position.clone().scale(55));
    this.loading = this.reloadTime;
    bullet.onTarget = ()=>{
      this.bullets = this.bullets.filter(it=>it!=bullet);
      this.onBulletTarget?.(target.clone());
    }
    this.bullets.push(bullet);
  }
}