import { Vector, IVector } from "../common/vector";
import { GamePlayer } from "./gamePlayer";
import { ITechBuild } from "./interactives";
import { tech } from './techTree';
import { IUnitConstructor } from "./units/IUnitConstructor";
import { checkMap, findClosestBuild } from "./distance";

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
  circlePoints: Array<IVector> = [];
  startAngle: number = 10; // угол отклонения при расчете точек на окружности
  stepBuilding: number = 0; // номер круга допустимой постройки
  constructor(startPoint:Vector, index:number){
    super(index);
    this.startPoint = startPoint;
    this.randomMove();
  }

  randomMove() {
    setTimeout(()=>{
      this.radius += this.radius< 10 ? 1 : 0.5;
      let rnd = Math.random();

      // console.log(rnd)
      if (rnd < 0.5) { // Создаем здание
        const build = this.getBuild(); // получение здания
        this.setBuilds(build);

        let curX: number;
        let curY: number;

        if (this.circlePoints.length === 0 && this.stepBuilding===0) {
          // строим первое здание
          curX = this.startPoint.x
          curY = this.startPoint.y
        } else {
          const lastEl = this.circlePoints[this.circlePoints.length - 1]
          curX = lastEl.x;
          curY = lastEl.y;
          this.circlePoints.pop()
        }
        let vector =  new Vector(
            curX,
            curY
          )
        let currentPointAdd = vector.clone().add(vector)
        this.onBuild(build,
          this.startPoint.clone().add(currentPointAdd)
        );
      }
      else if (rnd < 0.6) { // строит юнита
        // console.log('')
        // console.log('строит юнита')
        const availableUnit = this.getAvailableUnits();
        if (availableUnit.length) {
          const randonUnit = Math.floor(Math.random() * availableUnit.length)
          const unit = availableUnit[randonUnit];
          // console.log('randonUnit чтобы построить: ', unit)
          this.units.push(unit);
          // console.log('this.units ', this.units)
          // this.onUnit(unit); //todo ошибка при постронении юнита
        }        
      } else {
        //this.onAttack();
      }
      //this.onMove(this.startPoint.clone().add(new Vector(Math.floor(Math.random()*(4 +this.radius*2)-this.radius), Math.floor(Math.random()*(4+this.radius*2)-this.radius))));
      
      if (this.circlePoints.length === 0) {
        this.stepBuilding++
        this.circlePoints = this.getCirclePoints()
        // console.log(`точки на ${this.stepBuilding}-й окружности: `, this.circlePoints)
      }
      this.randomMove();
    }, 500);
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

  getCirclePoints(){
    let arrPoints: Array<IVector> = []
    let angle = this.startAngle / this.stepBuilding;
    for(let i=0; i <=180; i = i + angle){
      let x:number = this.startPoint.x + this.minDistance * this.stepBuilding * Math.cos(i);
      let y:number = this.startPoint.y + this.minDistance * this.stepBuilding * Math.sin(i);
      arrPoints.push({ x, y })
    }
    return arrPoints
  } 

}

//todo
/*
0) Если построек еще нет, строим произвольную точку start
1) Получить координаты всех точек, лежащих на окружности с центром start и радиусом this.minDistance 
  (this.minDistance - минимальное допустимое расстояние до постройки - из общих настроек)
  методом полрной засечки (приращение координат по углу и расстоянию).

  getCirclePoints(r: number = 1){
    let arrPoints: Array<IVector> = []
    for(let i=0; i <=180; i=i+10){
      let x:number = this.startPoint.x + this.minDistance * r * Math.cos(i)
      let y:number = this.startPoint.y + this.minDistance * r * Math.sin(i)
      arrPoints.push({ x, y })
    }
    return arrPoints
  } 

2) Обход массива arrPoints. Если 
  - расстояние до ближайшего своего здания > this.minDistance
  - расстояние до ближайшего здания противника > this.minDistance
  - если на этом месте можно строить
  => строим здание

3) По окончанию обхода, построить новую окружность с радиусом this.minDistance * 2 
и повторять шаго 1 и 2

*/