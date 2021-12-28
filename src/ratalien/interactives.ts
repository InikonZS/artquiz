import {Vector, IVector} from "../common/vector";

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
  }
}

export class UnitObject extends InteractiveObject{
  position: {x:number, y:number};
  target: Vector = null;
  speed: number = 1;
  attackRadius: number = 200;
  name:string;
  attackTarget: {damage:(amount:number)=>void} = null;
  constructor(){
    super();
  }

  inShape(tile:Vector){
    let pos = tile.clone().sub(new Vector(this.position.x, this.position.y));
    if (pos.abs()<15){
      return true;
    }
    return false;
  }

  step(){
    if (this.target){
      this.position = new Vector(this.position.x, this.position.y).add(new Vector(this.position.x, this.position.y).sub(this.target).normalize().scale(-this.speed));
      if (new Vector(this.position.x, this.position.y).sub(this.target).abs()<5){
        this.target = null;
      }
    } else {
      this.attack();
    }
  }

  attack(){
    if (this.attackTarget){
      console.log('atack');
      this.attackTarget.damage(1);
    }
  }
}