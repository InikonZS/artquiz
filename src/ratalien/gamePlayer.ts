interface IBuildInfo{
  desc:string,
  energy:number,
  deps:Array<string>,
  time:number,
  cost:number
}

interface IUnitInfo{
  desc:string,
  deps:Array<string>,
  time:number,
  cost:number
}

export class GamePlayer{
  colorIndex:number;
  money:number;
  //energy:number;
  builds:Array<IBuildInfo>;
  unuts:Array<IUnitInfo>;
  openedMap:Array<Array<any>>;

  constructor(){

  }

  getEnergy():{incoming:number, outcoming:number}{
    let incoming = this.builds.reduce((ac, it)=>it.energy<0? -it.energy + ac: ac, 0);
    let outcoming = this.builds.reduce((ac, it)=>it.energy>0? it.energy + ac: ac, 0);
    return {incoming, outcoming};
  }

  getAvailableBuilds():Array<any>{
    return [];
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