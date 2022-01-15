import { Vector } from "../common/vector";
import { GamePlayer } from "./gamePlayer";
import { ITechBuild } from "./interactives";
import { tech } from './techTree';
import { IUnitConstructor } from "./units/IUnitConstructor";


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
export class BotPlayer extends GamePlayer{
  startPoint: Vector;
  radius: number = 0;
  money: number = 30000;
  //onMove:(pos:Vector)=>void;
  onBuild:(build: ITechBuild, pos:Vector)=>void;
  onUnit:(unit:IUnitInfo)=>void;
  onAttack:()=>void;
  unitsBuildArray = ['barracs', 'techCenter', 'carFactory', 'dogHouse'];
  constructor(startPoint:Vector, index:number){
    super(index);
    this.startPoint = startPoint;
    this.randomMove();
  }

  randomMove(){
    setTimeout(()=>{
      this.radius += this.radius< 10?1:0.5;
      let rnd = Math.random();
      console.log(rnd)
      if (rnd < 0.3) {
        const build = this.getBuild();
        this.setBuilds(build);
        this.onBuild(build, this.startPoint.clone().add(new Vector(Math.floor(Math.random()*(4 +this.radius*2)-this.radius), Math.floor(Math.random()*(4+this.radius*2)-this.radius))));
      } else if (rnd < 0.6) {
        const availableUnit = this.getAvailableUnits();
        if (availableUnit.length) {
          const unit = availableUnit[Math.floor(Math.random() * availableUnit.length)];
          this.units.push(unit);
          this.onUnit(unit);
        }        
      } else {
        //this.onAttack();
      }
      //this.onMove(this.startPoint.clone().add(new Vector(Math.floor(Math.random()*(4 +this.radius*2)-this.radius), Math.floor(Math.random()*(4+this.radius*2)-this.radius))));
      this.randomMove();
    }, 10000);
  }

  setUnit(unit: IUnitInfo) {
    this.units.push(unit);    
  }

  getBuild():ITechBuild{
    const builds = this.getAvailableBuilds();
    if (this.units.length < 6) {
      const warBuild = builds.filter(item => this.unitsBuildArray.includes(item.desc[0]))
      if (warBuild.length > 0) {
        return warBuild[Math.floor(Math.random() * warBuild.length)];
      }
    }
    return builds[Math.floor(Math.random() * builds.length)];
  }

}