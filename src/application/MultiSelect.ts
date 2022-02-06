import {InteractiveObject} from "../ratalien/units/interactiveObject";
import {Vector} from "../common/vector";
import {AbstractUnit} from "../ratalien/units/abstractUnit";


export class MultiSelectController {
  selectedUnits: AbstractUnit[]
  pathes: Vector[][]
  private tilesMap: Map<string,number>;

  constructor(selection: AbstractUnit[]) {
    this.selectedUnits = selection
    this.tilesMap= new Map()
    this.selectedUnits.forEach(un=>{
      if(this.tilesMap.has(`${un.tileCoordinates.x}-${un.tileCoordinates.y}`)==false){
      //  this.tilesMap.set(`${un.tileCoordinates.x}-${un.tileCoordinates.y}`,[un])
      }else{
       // this.tilesMap.set(`${un.tileCoordinates.x}-${un.tileCoordinates.y}`,
       //   this.tilesMap.get(`${un.tileCoordinates.x}-${un.tileCoordinates.y}`).push(un))
      }
    })
    console.log("$$",this.selectedUnits)
    console.log(this.tilesMap)
  }

  compositionUnits() {
    console.log('composition')
    const pointsMap:Map< string,number>=new Map()
    //если у юнита нет ни одного соседа юнита, то
    //найди ближайшего бнита
    //если расстояние меньше 5
    //тогда проверь клетки, где стоят юниты- усли у них есть сводобный сабтайлы, то встань туда, если нет, то
    //просто протрассируйся к ближайшему юниту.
    //---потом уже всем строй путь
    this.selectedUnits.forEach(unit=>{
      if(pointsMap.has(`${unit.tileCoordinates.x}-${unit.tileCoordinates.y}`)){
        pointsMap.set(`${unit.tileCoordinates.x}-${unit.tileCoordinates.y}`,
          pointsMap.get(`${unit.tileCoordinates.x}-${unit.tileCoordinates.y}`)+1)
      }else{
        pointsMap.set(`${unit.tileCoordinates.x}-${unit.tileCoordinates.y}`,1)
      }

    })
    console.log(Array.from(pointsMap).forEach(e=> console.log(e)));
    //const sortM=new Map();
   // console.log(sortM);
    //получи сколько юнитов выделено
    //найди точку в которой стоит больше всего юнитов
    //если такой нет то просто ближайшую к цели

    //если она не полная, протрассируйся до свободного подтайла
    //если полная, то найди свободную соседнюю клетку крест и трассируйся к ней
    //если ее нет то не стройся а просто трассируйся
  }

  spreading() {
//если один достиг цели то остальные получают
  }

  restructure() {

  }

  deselectUnits() {
    this.selectedUnits = null
  }

  getSelectedUnits() {
    return this.selectedUnits
  }
}