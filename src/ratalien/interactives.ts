import {Vector, IVector} from "../common/vector";
import {TraceMap} from "./traceMap";

export class InteractiveObject{
  isHovered: boolean;
  onMouseMove: any;
  onMouseEnter: any;
  onMouseLeave: any;
  onClick: any;

  constructor(){

  }

  handleMove(tile:Vector){
    if (this.inShape(tile)){
      this.onMouseMove?.(tile);
      if (!this.isHovered) {
        this.isHovered = true;
        this.onMouseEnter?.(tile);
      }
    } else {
      if (this.isHovered) {
        this.isHovered = false;
        this.onMouseLeave?.(tile);
      }
    }  
  }

  handleClick(e:Vector){
    if (this.inShape(e)){
      this.onClick?.(e);
    }
  }

  inShape(tile:Vector){
    return false;
  }
}

export class MapObject extends InteractiveObject{
  position: {x:number, y:number};
  tiles: Array<Array<number>>;
  sprite: HTMLImageElement;
  health:number;
  name:string;
  player:number;

  onDestroyed: ()=>void;

  constructor(){
    super();
    this.health = 100;
  }

  inShape(tile:Vector){
    let pos = tile.clone().sub(new Vector(this.position.x, this.position.y));
    if (this.tiles[pos.y] && this.tiles[pos.y][pos.x]!=null && this.tiles[pos.y][pos.x]!=0){
      return true;
    }
    return false;
  }

  damage(amount:number){
    this.health -=1;
    if (this.health<=0){
      this.onDestroyed();
    }
  }
}

export class UnitObject extends InteractiveObject{
  position: {x:number, y:number};
  target: Vector = null;
  speed: number = 1;
  attackRadius: number = 200;
  name:string;
  attackTarget: {damage:(amount:number)=>void, position:IVector} = null;
  player:number;
  time: number= 0;
  private stepIndex: number;

  constructor(){
    super();
    this.stepIndex = 0
  }

  inShape(tile:Vector){
    let pos = tile.clone().sub(new Vector(this.position.x, this.position.y));
    if (pos.abs()<15){
      return true;
    }
    return false;
  }

  step(delta:number,traceMap: TraceMap){
        //fix logic atack and move
    this.time -= delta;
    if (this.target) {
      //TODO unit each Step
      const path = traceMap.getPath()
      if (path && this.stepIndex < path.length) {
        this.position = new Vector(path[this.stepIndex].x * 50 + 50, path[this.stepIndex].y * 50 + 50)
          .add(new Vector(path[this.stepIndex].x * 50 + 50, path[this.stepIndex].y * 50 + 50)
            .sub(this.target).normalize().scale(-this.speed));

        if (new Vector(this.position.x, this.position.y).sub(this.target).abs() < 5) {
          this.target = null;
        }
        this.stepIndex++
      }else if(path && this.stepIndex < path.length){
        console.log('TTTT')
      }


    }
    // if (this.target){
    //   this.position = new Vector(this.position.x, this.position.y).add(new Vector(this.position.x, this.position.y).sub(this.target).normalize().scale(-this.speed));
    //   if (new Vector(this.position.x, this.position.y).sub(this.target).abs()<5){
    //     this.target = null;
    //   }
    // }
    else {
      
      this.attack(delta);
    }
  }

  attack(delta:number){
    //fix logic atack and move
    if (this.attackTarget){
     // console.log('atack');
      if (Vector.fromIVector(this.attackTarget.position).scale(55).sub(Vector.fromIVector(this.position)).abs()< this.attackRadius ){
        this.target = null;
        if (this.time<=0){
          this.time = 500;
          this.attackTarget.damage(1);
        }
      } else {
        this.target = Vector.fromIVector(this.attackTarget.position).scale(55);
      }
    }
  }
}