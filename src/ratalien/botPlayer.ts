import { Vector } from "../common/vector";
import { tech } from './techTree';

export interface IBuildInfo{
  desc:Array<string>,
  energy:number,
  deps: Array<string>,
  name: string,
  time:number,
  cost:number
}

interface IUnitInfo{
  spawn:Array<string>,
  deps: Array<string>,
  name: string,
  time:number,
  cost: number,
  radius: number,
  speed: number,
  minRadius: number, 
  reloadingTime: number,
}
export class BotPlayer{
  startPoint: Vector;
  radius: number = 0;
  builds: Array<IBuildInfo> = [];
  units:Array<IUnitInfo> = [];
  //onMove:(pos:Vector)=>void;
  onBuild:(pos:Vector)=>void;
  onUnit:()=>void;
  onAttack:()=>void;

  constructor(startPoint:Vector){
    this.startPoint = startPoint;
    this.randomMove();
  }
  setBuilds(build: IBuildInfo) {
    this.builds.push(build);
    //this.onUpdateBuild.emit();
  }

  setUnit(unit: IUnitInfo) {
    this.units.push(unit);    
  }
  
  getAvailableBuilds():Array<IBuildInfo> {
    if (!this.builds.length) {
      return tech.builds.filter(item => item.deps.includes('rootAccess'));
    }
    const nameBuild = Array.from(new Set(this.builds.map(item => item.desc[0])));

    return tech.builds.filter(item => item.deps.includes('rootAccess'))
      .concat(tech.builds.filter(item => item.deps.every(elem=>nameBuild.includes(elem))));
  }

  getAvailableUnits(): Array<IUnitInfo>{
    const nameBuild = this.builds.map(item => item.desc[0]);
    return tech.units.filter(item=>item.deps.every(elem=>nameBuild.includes(elem)))
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