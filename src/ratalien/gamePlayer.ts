import { tech } from './techTree';
import Signal from '../common/signal';
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

export class GamePlayer{
  colorIndex:number;
  money:number=5000;
  //energy:number;
  builds: Array<IBuildInfo> = [];
  units:Array<IUnitInfo> = [];
  openedMap: Array<Array<any>>;
  onUpdateBuild: Signal<void> = new Signal();

  constructor(){

  }

  setBuilds(build: IBuildInfo) {
    this.money -= build.cost;
    this.builds.push(build);
    this.onUpdateBuild.emit();
  }

  setUnit(unit: IUnitInfo) {
    this.money -= unit.cost;
    this.units.push(unit);    
  }

  getEnergy():{incoming:number, outcoming:number}{
    let incoming = this.builds.reduce((ac, it)=>it.energy<0? -it.energy + ac: ac, 0);
    let outcoming = this.builds.reduce((ac, it)=>it.energy>0? it.energy + ac: ac, 0);
    return {incoming, outcoming};
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

  getMaxMoney():number{
    return 1000;
  }

  setMoney(value:number){
    this.money = value;
  }
}