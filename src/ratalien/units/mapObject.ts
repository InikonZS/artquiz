import {Vector, IVector} from "../../common/vector";
import { InteractiveObject } from "./interactiveObject";
import { ITechBuild } from "./iTechBuild";
import {consts} from "../globals";

export class MapObject extends InteractiveObject{
  _position: Vector;
  tiles: Array<Array<number>>;
  sprite: HTMLImageElement;
  health:number;
  name:string;
  player:number;
  type:string = 'build';
  get position(){
    return this._position;
  }
  set position(val:Vector){
    this._position = val;
  }

  onDestroyed: ()=>void;
  res: Record<string, HTMLImageElement>;

  constructor(build:ITechBuild, res:Record<string, HTMLImageElement>){
    super();
    this.health = 100;
    this.tiles = build.mtx.map(it=>it.map(jt=>parseInt(jt)));
    this.name = build.name;
    this.res = res;
  }

  inShape(tile:Vector, cursor:Vector){
    let pos = tile.clone().sub(new Vector(this.position.x, this.position.y));
    if (this.tiles[pos.y] && this.tiles[pos.y][pos.x]!=null && this.tiles[pos.y][pos.x]!=0){
      return true;
    }
    return false;
  }

  damage(amount:number){
    this.health -=amount;
    if (this.health<=0){
      this.onDestroyed();
    }
  }

  render(ctx:CanvasRenderingContext2D, camera:Vector, delta:number, size?:number, selected?:boolean, primary?:boolean){
    this.tiles.forEach((row, i)=>row.forEach((cell, j)=>{
      if (this.tiles[i][j]!=0){
        this.drawTile(ctx, new Vector(j+this.position.x, i+this.position.y), camera, this.isHovered?"#9999":consts.colors[this.player], size);
      }
    })); 
    
    ctx.fillStyle = '#049';
    const pos = new Vector(this.position.x*size, this.position.y*size).add(camera);
      ctx.fillText(`health: ${this.health.toString()}/100` , pos.x, pos.y +10);
      ctx.fillText(this.name, pos.x, pos.y +20);
      if (selected){
        ctx.fillText('selected', pos.x, pos.y +30);
      }
      if (primary){
        ctx.fillText('primary', pos.x, pos.y +40);
      }
      ctx.drawImage(this.res['plant'], pos.x, pos.y, size * 4, size * 4 );
  }

  drawTile(ctx:CanvasRenderingContext2D, position:IVector, camera:IVector, color:string, size:number){
    const sz = size;//55;//this.sz;
    ctx.fillStyle = color;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(camera.x + position.x * sz, camera.y+ position.y *sz, sz, sz);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

}