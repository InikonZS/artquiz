import {Vector, IVector} from "../../common/vector";

export class InteractiveObject{
  isHovered: boolean;
  onMouseMove: any;
  onMouseEnter: any;
  onMouseLeave: any;
  onClick: any;
  onDestroyed: ()=>void;
  //position: {x:number, y:number};
  player:number;
  name:string;
  type:string = 'interactive';
  get position(){
    return new Vector(0,0);
  }
  set position(val:Vector){
    
  }

  constructor(){

  }

  handleMove(tile:Vector, cursor:Vector){
    if (this.inShape(tile, cursor)){
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

  handleClick(tile:Vector, cursor:Vector){
    if (this.inShape(tile, cursor)){
      this.onClick?.(tile, cursor);
    }
  }

  inShape(tile:Vector, cursor:Vector){
    return false;
  }

  render(ctx:CanvasRenderingContext2D, camera:Vector, ...props:any){
  }
}