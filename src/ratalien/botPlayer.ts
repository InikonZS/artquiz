import { Vector } from "../common/vector";

export class BotPlayer{
  startPoint: Vector;
  radius: number = 0;
  //onMove:(pos:Vector)=>void;
  onBuild:(pos:Vector)=>void;
  onUnit:()=>void;
  onAttack:()=>void;

  constructor(startPoint:Vector){
    this.startPoint = startPoint;
    this.randomMove();
  }

  randomMove(){
    setTimeout(()=>{
      this.radius += this.radius< 10?1:0.5;
      let rnd = Math.random();
      if (rnd<0.3){
        this.onBuild(this.startPoint.clone().add(new Vector(Math.floor(Math.random()*(4 +this.radius*2)-this.radius), Math.floor(Math.random()*(4+this.radius*2)-this.radius))));
      } else if(rnd<0.6){
        this.onUnit();
      } else {
        this.onAttack();
      }
      //this.onMove(this.startPoint.clone().add(new Vector(Math.floor(Math.random()*(4 +this.radius*2)-this.radius), Math.floor(Math.random()*(4+this.radius*2)-this.radius))));
      this.randomMove();
    }, 6000);
  }

}