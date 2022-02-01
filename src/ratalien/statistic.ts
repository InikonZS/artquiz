import Control from "../common/control";
import { GamePlayer, IBuildInfo, IUnitInfo } from "./gamePlayer";
import { ITechBuild } from "./interactives";

export interface IStatistic{
  builds: Array<ITechBuild>,
  units: Array<IUnitInfo>,
}

export class Statistic{
  state: IStatistic;
    
  constructor() {
    this.state = {builds:[], units:[]}
  }

  setUnit(unit: IUnitInfo) {
    this.state.units.push(unit)
  }
  setBuild(bld: ITechBuild) {
    this.state.builds.push(bld)
  }

  getUnits():Array<IUnitInfo> {
    return this.state.units;
  }

  getBuilds(): Array<ITechBuild> { 
    return this.state.builds;
  }

  getAll(): IStatistic {
    return this.state;
  }

  // set(data: ITechBuild | IUnitInfo) {
  //   if (this.isBuild(data)) {
  //     this.state.builds.push(data)
  //   }
  //   if (this.isUnit(data)) {
  //     this.state.units.push(data)
  //   }
  // }

  // isBuild(obj: any): obj is ITechBuild {
  //   return (obj.mtx !== undefined)
  // }

  // isUnit(obj: any): obj is IUnitInfo {
  //   return (obj.spawn !== undefined)
  // }

}
