import {Vector, IVector} from "../common/vector";
import {TraceMap, IPathPoint} from "./traceMap";
import {consts} from "./globals";

export interface ITechBuild{
  deps: string[];
  desc: string[];
  name: string;
  energy: number;
  cost: number;
  time: number;
  mtx:Array<Array<string>>;
}

export class InteractiveObject{
  isHovered: boolean;
  onMouseMove: any;
  onMouseEnter: any;
  onMouseLeave: any;
  onClick: any;
  onDestroyed: ()=>void;
  position: {x:number, y:number};
  player:number;
  name:string;
  type:string = 'interactive';

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

export class MapObject extends InteractiveObject{
  position: {x:number, y:number};
  tiles: Array<Array<number>>;
  sprite: HTMLImageElement;
  health:number;
  name:string;
  player:number;
  type:string = 'build';

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
    this.health -=1;
    if (this.health<=0){
      this.onDestroyed();
    }
  }

  render(ctx:CanvasRenderingContext2D, camera:Vector, size?:number, selected?:boolean, primary?:boolean){
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

export class UnitObject extends InteractiveObject{
  positionPx: Vector;//{x:number, y:number};
  target: Vector = null;
  speed: number = 1;
  attackRadius: number = 200;
  name:string;
  attackTarget: {damage:(amount:number)=>void, position:IVector} = null;
  player:number;
  time: number= 0;
  private _stepIndex: number;
  path: Vector[];//IPathPoint[]; 
  health: number = 100;
  tileChecker: (pos: Vector) => boolean;
  type:string = 'unit';

  constructor(){
    super();
    this._stepIndex = 1

  }

  inShape(tile:Vector, cursor:Vector){
    let pos = cursor.clone().sub(new Vector(this.positionPx.x, this.positionPx.y));
    if (pos.abs()<15){
      return true;
    }
    return false;
  }

  // step(delta:number,traceMap: TraceMap){
  //       //fix logic atack and move

  //   this.time -= delta;
  //   const stepIndex = Math.floor(this._stepIndex);
  //   if (this.target) {
  //     //TODO check Tile quarter-> offset insideTile
  //     if (!this.path){
  //       this.path = traceMap.getPath()
  //     }
  //     const path = this.path;

  //     if (path && stepIndex < path.length) {
  //       const pathVector = new Vector(path[stepIndex].x * 55+55/2, path[stepIndex].y * 55+55/2)
  //       /*this.position = pathVector.clone()
  //         .add(pathVector
  //           .sub(this.target).normalize().scale(-this.speed));*/
  //           this.position = new Vector(this.position.x, this.position.y).add(new Vector(this.position.x, this.position.y).sub(pathVector).normalize().scale(-this.speed));
         

  //       if (new Vector(this.position.x, this.position.y).sub(this.target).abs() < 5) {
  //         this.target = null;
  //         this.path = null;
  //       }
        
  //       //this._stepIndex+=0.1;
  //       //теперь он ходит плавно
  //       if (new Vector(this.position.x, this.position.y).sub(pathVector).abs()<this.speed*2){
  //         this.position = pathVector.clone()/*
  //         .add(pathVector
  //           .sub(this.target).normalize().scale(-this.speed));*/
  //           this._stepIndex+=1;
  //           //this.path = traceMap.getPath();
  //       }
  //     }else if(path && stepIndex == path.length){
  //     }
  //   }
  //   // if (this.target){
  //   //   this.position = new Vector(this.position.x, this.position.y).add(new Vector(this.position.x, this.position.y).sub(this.target).normalize().scale(-this.speed));
  //   //   if (new Vector(this.position.x, this.position.y).sub(this.target).abs()<5){
  //   //     this.target = null;
  //   //   }
  //   // }
  //   else {
      
  //     this.attack(delta);
  //   }
  // }
clearStepIndex(){
    console.log("index",this._stepIndex)
  this._stepIndex=1;
  this.path = null;
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

  render(ctx:CanvasRenderingContext2D, camera:IVector, size:number, selected:boolean){
    const sz = 10;
    ctx.fillStyle = this.isHovered?"#9999":consts.colors[this.player];
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(camera.x + this.positionPx.x /*+ (55-10)/2*/, camera.y+ this.positionPx.y /*+ (55-10)/2*/, sz, sz, 0, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.fillText(this.name, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-10);
    ctx.fillText(`health: ${this.health}`, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-20);
    if (selected){
      ctx.fillText(`selected`, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-30);  
    }
    this.step();
  }

  step(){
    //this.reloadTime--;
    const sz = 55;
    if (this.target && this.tileChecker && !this.tileChecker(new Vector(Math.floor(this.target.x / sz), Math.floor(this.target.y / sz)))){
      //this.target = this.getTilePosition().scale(10);
      //this.position = this.getTilePosition().scale(10);
      /*if (!this.path[this.path.length-1]) return;
      let stp:Array<Vector> = [];
      steps.forEach(step=>{
        if (this.tileChecker(new Vector(Math.floor(this.getTilePosition().x + step.x), Math.floor(this.getTilePosition().y + step.y)))){ 
          let ep = new Vector(Math.floor(this.getTilePosition().x + step.x), Math.floor(this.getTilePosition().y + step.y)).scale(10);
          stp.push(ep);
          //return true;
        }
        //return false;
      })
      let mv = null;
      let ml = Number.MAX_SAFE_INTEGER;
      stp.forEach(it=>{
        let len = it.clone().sub(this.path[this.path.length-1]).abs();
        if (len< ml){
          ml = len;
          mv = it;
        }
      });
      this.target = mv;*/
      return;
    }
    if (this.target){
      const speed = 8.5;
      this.positionPx = this.positionPx.clone().add(this.target.clone().sub(this.positionPx).normalize().scale(speed));
      if (this.positionPx.clone().sub(this.target).abs()<=speed){
        this.positionPx = this.target.clone();
        if (this.path && this.path.length){
          this.target = this.path.pop().clone().scale(sz);
        }
      }
    }else {
      if (this.path && this.path.length){
        this.target = this.path.pop().clone().scale(sz);
      }
    }

    /*if (this.attackTarget){
      let dist = this.attackTarget.clone().sub(this.position).abs();
      if (dist < 100){
        this.target = null;
        this.path = null;
        this.shot();
      }
    }*/
  } 

  setPath(path:Array<Vector>, tileChecker:(pos:Vector)=>boolean){
    const sz =55;
    console.log('sp ', path);
    this.path = [...path].reverse();
    this.target = this.path.pop().clone().scale(sz);
    this.tileChecker = tileChecker;
  }
}