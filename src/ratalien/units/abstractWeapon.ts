import {Vector, IVector} from "../../common/vector";
import {Bullet} from "./bullet";
interface IBulletConstructor{
  new(target: Vector, position: Vector): Bullet;
}

export default class AbstractWeapon{
  attackRadius: number;
  bullets: Array<Bullet> = [];
  reloadTime: number;
  private loading: number = 0;
  private BulletConstructor: IBulletConstructor;
  position:Vector;
  onBulletTarget:(point:Vector)=>void;

  constructor(BulletConstructor:IBulletConstructor, attackRadius: number, reloadTime: number){
    this.BulletConstructor = BulletConstructor;
    this.attackRadius = attackRadius; 
    this.reloadTime = reloadTime;
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
    
    if (this.loading<=0 && target.clone().sub(this.position.clone().scale(55)).abs()<this.attackRadius){
      //console.log('radiused');
      this.shot(target);
      return true;
    }
    return false;
  }

  private shot(target:Vector){
    const bullet = new this.BulletConstructor(target, this.position.clone().scale(55));
    this.loading = this.reloadTime;
    bullet.onTarget = ()=>{
      this.bullets = this.bullets.filter(it=>it!=bullet);
      this.onBulletTarget?.(target.clone());
    }
    this.bullets.push(bullet);
  }
}