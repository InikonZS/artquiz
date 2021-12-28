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
  deps:Array<string>,
  time:number,
  cost:number,
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
    console.log(this.builds)
    this.onUpdateBuild.emit();
  }

  getEnergy():{incoming:number, outcoming:number}{
    let incoming = this.builds.reduce((ac, it)=>it.energy<0? -it.energy + ac: ac, 0);
    let outcoming = this.builds.reduce((ac, it)=>it.energy>0? it.energy + ac: ac, 0);
    return {incoming, outcoming};
  }

  getAvailableBuilds()/*:Array<any>*/ {
    if (!this.builds.length) {
      return tech.builds.filter(item => item.deps.includes('rootAccess'));
    }
    const name = Array.from(new Set(this.builds.map(item => item.desc[0])));

    return tech.builds.filter(item => item.deps.includes('rootAccess'))
      .concat(tech.builds.filter(item => item.deps.every(elem=>name.includes(elem))));
  }

  getAvailableUnits():Array<any>{
    return [];
  }

  getMaxMoney():number{
    return 1000;
  }

  setMoney(value:number){
    this.money = value;
  }
}