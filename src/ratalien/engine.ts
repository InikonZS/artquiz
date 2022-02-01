import Control from "../common/control";
import Signal from "../common/signal";
import {Vector, IVector} from "../common/vector";
import { InteractiveObject } from "./interactives";
import {getMapFromImageData, getImageData, loadImage, findPath, indexateAsync, steps, tracePathes} from "./tracer";
import mpfile from './map96g.png';

class BaseNode{
  private owners:Array<BaseNode>;
  private childs:Array<BaseNode>;
  public isDestroyed: boolean;
  private didChildDestroy: boolean;
  private didOwnerDestroy: boolean;

  constructor(){
    this.owners = [];
    this.childs = [];
    this.isDestroyed = false;
    this.didChildDestroy = false;
  }

  private requestHandleChildDestroy(){
    this.didChildDestroy = true; 
  }

  private requestHandleOwnerDestroy(){
    this.didChildDestroy = true; 
  }

  private handleChildDestroy(){
    if (this.didChildDestroy){
      this.childs = this.childs.filter(child => child.isDestroyed !== true);
      this.didChildDestroy = false;
    }
  }

  private handleOwnerDestroy(){
    if (this.didOwnerDestroy){
      this.owners = this.owners.filter(owner => owner.isDestroyed !== true);
      this.didOwnerDestroy = false;
    }
  }

  public tick(time:number){
    this.childs.forEach(child => child.tick(time));
    this.handleChildDestroy();
    this.handleOwnerDestroy();
  }

  public attach(node:BaseNode){
    this.owners.push(node);
  }

  public append(node:BaseNode){
    this.childs.push(node);
    node.attach(this);
  }

  public destroy(){
    this.isDestroyed = true;
    this.owners.forEach(owner => owner.requestHandleChildDestroy());
    this.childs.forEach(child => child.requestHandleOwnerDestroy());
  }
}

class BuildNode extends BaseNode{
  constructor(){
    super();
  }

  render(time:number, context:CanvasRenderingContext2D){

    
  }

  tick(time:number){
    //this.render(time);
    super.tick(time);
  }
}

interface IRenderable{
  render: (context:CanvasRenderingContext2D, time:number, camera:Vector)=>void;
}

interface IInteractive{
  handleMove: (pos:Vector)=>void;
  handleClick: (pos:Vector)=>void;
  position:Vector;
  selected: boolean;
}

/*interface IDamagble{
  render: (context:CanvasRenderingContext2D, time:number, camera:Vector)=>void;
}*/

interface IGameObject{
  render: (context:CanvasRenderingContext2D, time:number, camera:Vector)=>void;
  react: (time:number, reactList:Array<IGameObject>)=>void;
}

class Engine{
  public rootNode: BaseNode;
  private lastFrameId: number;
  public onTick: Signal<number> = new Signal();

  constructor(){
    this.rootNode = new BaseNode();
  }

  start(){
    this.renderFrame();
  }

  stop(){
    cancelAnimationFrame(this.lastFrameId);
  }

  renderFrame(){
    this.lastFrameId = requestAnimationFrame((currentTime:number)=>{
      //this.rootNode.tick(currentTime);
      this.onTick.emit(currentTime);
      this.renderFrame();
    })
  }
}

class RenderList{
  list:Array<IRenderable & IInteractive & ISelectable> = [];
  constructor(){

  }

  render(ctx:CanvasRenderingContext2D, time:number, camera:Vector){
    this.list.forEach(it=>it.render(ctx, time, camera));
  }
}

class RoundNode extends InteractiveObject{
  position: Vector;
  color: string;
  selected: boolean = false;
  path:Array<Vector> = [];
  target:Vector = null;
  attackTarget:Vector = null;
  tileChecker: (pos: Vector) => boolean;
  reloadTime: number = 0;
  bullet: Vector;

  constructor(){
    super();
    this.color = "f00";
    this.onMouseEnter = ()=>{
      this.color = "#0f0";
    }

    this.onMouseLeave = ()=>{
      this.color = "#f00";
    }
  }

  inShape(position:Vector):boolean{
    return position.sub(this.position).abs()<10;
  }

  render(ctx:CanvasRenderingContext2D, time:number, camera:Vector){
    this.step();
    const sz = 5;
    ctx.fillStyle = this.selected ? "#00f":this.color;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(camera.x+5 + this.position.x, camera.y+ this.position.y+5, sz, sz, 0, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (this.bullet){
      this.bullet.sub(this.bullet.clone().sub(this.attackTarget).normalize());
      if (this.bullet.clone().sub(this.attackTarget).abs()<1){
        this.bullet = null;
        return;
      }
      this.renderBullet(ctx, time, camera);
    }
  }

  renderBullet(ctx:CanvasRenderingContext2D, time:number, camera:Vector){
    const sz = 2;
    ctx.fillStyle = "#0ff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(camera.x+5 + this.bullet.x, camera.y+ this.bullet.y+5, sz, sz, 0, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  select(){
    this.selected = true;
  }

  unselect(){
    this.selected = false;
  }

  setPath(path:Array<Vector>, tileChecker:(pos:Vector)=>boolean){
    this.path = [...path].reverse();
    this.target = this.path.pop().clone().scale(10);
    this.tileChecker = tileChecker;
  }

  getTilePosition(){
    return new Vector(Math.floor(this.position.x / 10), Math.floor(this.position.y / 10));
  }

  shot(){
    if (this.reloadTime<=0){
      this.bullet = this.position.clone();
      this.reloadTime = 300;
    }
  }

  step(){
    this.reloadTime--;
    if (this.target && this.tileChecker && !this.tileChecker(new Vector(Math.floor(this.target.x / 10), Math.floor(this.target.y / 10)))){
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
      const speed = 0.5;
      this.position = this.position.clone().add(this.target.clone().sub(this.position).normalize().scale(speed));
      if (this.position.clone().sub(this.target).abs()<=speed){
        this.position = this.target.clone();
        if (this.path && this.path.length){
          this.target = this.path.pop().clone().scale(10);
        }
      }
    }else {
      if (this.path && this.path.length){
        this.target = this.path.pop().clone().scale(10);
      }
    }

    if (this.attackTarget){
      let dist = this.attackTarget.clone().sub(this.position).abs();
      if (dist < 100){
        this.target = null;
        this.path = null;
        this.shot();
      }
    }
  } 
}

class MultiSelect{
  multiStart:Vector;
  multiEnd:Vector;

  render(ctx:CanvasRenderingContext2D, time:number, camera:Vector){
    ctx.fillRect(this.multiStart.x, this.multiStart.y, -this.multiStart.x + this.multiEnd.x, -this.multiStart.y + this.multiEnd.y)
  }
}

interface ISelectable{
  select:()=>void;
  unselect:()=>void;
  setPath:(path:Array<Vector>, tileChecker:(pos:Vector)=>boolean)=>void;
  position: Vector;
}

class MainSlot{
  list:Array<ISelectable> = [];
  constructor(){

  }

  reset(){
    this.list.forEach(it=>it.unselect());
    this.list = [];
  }

  selectNode(node:ISelectable){
    node.select();
    this.list.push(node);
  }
}

class GameMap{
  map:Array<Array<number>> = [[]];
  sz = 10;
  canvas: HTMLCanvasElement;
  textures: Record<string, HTMLImageElement>;
  constructor(textures:Record<string, HTMLImageElement>){
    this.textures = textures;
  }

  loadFromFile(src:string):Promise<GameMap>{
    return loadImage(src).then(img=>{
      let data = getImageData(img);
      let map = getMapFromImageData(data);
      this.map = map;
      this.preRender();
      return this;
    });
  }

  drawTile(ctx:CanvasRenderingContext2D, position:IVector, camera:IVector, color:string){
    const sz = 52//this.sz;
    ctx.fillStyle = color;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(camera.x + position.x * sz, camera.y+ position.y *sz, sz, sz);
    ctx.closePath();
    //ctx.fill();
    //ctx.stroke();
    //ctx.drawImage(this.textures['grass'], camera.x + position.x * sz, camera.y+ position.y *sz, sz, sz);
    if (color!='#f00'){
    ctx.drawImage(this.textures['rocks'],camera.x + position.x * sz, camera.y+ position.y *sz-64, sz, sz*1.5);
    }
  }

  preRender(){
    const colors:Array<string> = ['#f00', '#f90', "#090"];
    const canvas = document.createElement('canvas');
    canvas.width = this.map[0].length * this.sz;
    canvas.height = this.map.length * this.sz;
    let ctx = canvas.getContext('2d');
    this.map.forEach((row, y)=>row.forEach((value, x)=>{
      this.drawTile(ctx, {x, y}, {x:0, y:0}, colors[value]||"#fff");  
    }));
    this.canvas = canvas;
  }

  render(ctx:CanvasRenderingContext2D, time:number, camera:Vector){
    /*
    this.map.forEach((row, y)=>row.forEach((value, x)=>{
      this.drawTile(ctx, {x, y}, camera, colors[value]||"#fff");  
    }));*/
    if (this.canvas){
      ctx.drawImage(this.canvas, 0, 0);
    }
  }
}

export class MainCanvas extends Control{
  engine: Engine;
  //multiStart: Vector;
  multiSelect:MultiSelect;
  cursor: Vector;
  mainSlot: MainSlot;
  map: GameMap;
  renderList: RenderList;
  pathes: Vector[][];
  constructor(parentNode:HTMLElement, textures: Record<string, HTMLImageElement>){
    super(parentNode, 'div');
    const canvas = new Control<HTMLCanvasElement>(this.node, 'canvas');
    canvas.node.width = 800;
    canvas.node.height = 600;
    const context = canvas.node.getContext('2d');
    this.engine = new Engine();
    const renderList = new RenderList();
    this.renderList = renderList;
    this.mainSlot = new MainSlot();
    let pathes:Array<Array<Vector>> = [];
    this.pathes = pathes;

    const map = new GameMap(textures);
    this.map = map;
    map.loadFromFile(mpfile);

    canvas.node.onmousedown =e=>{
     // console.log(e.button);
      if (e.button == 2) {
        let mp = map.map.map(it=>it.map(jt=>jt==0?Number.MAX_SAFE_INTEGER:-1));
        let indexPoint = {x:Math.floor(e.offsetX/10), y:Math.floor(e.offsetY/10)};
        /*indexateAsync(mp, [indexPoint], 0, ()=>{
          this.mainSlot.list.forEach(unit=>{
            //if (!indexPoint) { return;}
            let path = findPath(mp, Vector.fromIVector(indexPoint), new Vector(Math.floor(unit.position.x/10)*1, Math.floor(unit.position.y/10)*1));
            if (path){
              pathes.push(path.map(it=>it));
              unit.setPath(path, (pos)=>this.isEmptyTile(pos, unit));
              console.log(path);
            }
          });
        }, Date.now())*/
        const destinations = this.mainSlot.list.map(unit=>{
          return new Vector(Math.floor(unit.position.x/10), Math.floor(unit.position.y/10))
        });
        const units = [...this.mainSlot.list];
        tracePathes(mp, indexPoint, destinations, (pathes)=>{
          this.pathes = pathes;
          pathes.forEach((path, i)=>{
            const unit = units[i];
            console.log('SS S')
            unit.setPath(path, (pos)=>this.isEmptyTile(pos, unit));
            (unit as RoundNode).attackTarget = Vector.fromIVector(indexPoint).scale(10);
          })
        })
        return; 
      } 
      //if (this.mode != 0) return;
      //this.multiStart = new Vector(e.offsetX, e.offsetY);
      this.multiSelect = new MultiSelect();
      this.multiSelect.multiStart = new Vector(e.offsetX, e.offsetY);
      this.multiSelect.multiEnd = this.cursor;
      let listener = ()=>{
        //this.mainSlot.list.forEach (it=>it.unselect());
        this.mainSlot.reset();//.list = [];
        renderList.list.forEach(it=>{
          if (inBox(it.position, this.multiSelect.multiStart, this.multiSelect.multiEnd)){
            //this.mainSlot.list.push(it);
            this.mainSlot.selectNode(it);
          }
        });
        this.multiSelect = null;
        
        window.removeEventListener('mouseup', listener);
      }
      window.addEventListener('mouseup', listener);
    }

    this.node.oncontextmenu =(e)=>{
      e.preventDefault();
    }
    this.node.onmousemove = (e)=>{
      this.cursor = new Vector(e.offsetX, e.offsetY);
      if(this.multiSelect){
        this.multiSelect.multiEnd = this.cursor;
      }
      renderList.list.forEach(it=> it.handleMove(new Vector(e.offsetX, e.offsetY)));
    }
    this.node.onclick = (e)=>{
      if (e.button == 1){

      };
      renderList.list.forEach(it=> it.handleClick(new Vector(e.offsetX, e.offsetY)));
    }
    this.engine.onTick.add((time)=>{
      context.clearRect(0,0, 800, 600);
      map.render(context, time, new Vector(0, 0));
      renderList.render(context, time, new Vector(0,0));
      this.pathes.forEach(it=>{
        it.forEach(point=>{
          context.fillStyle = '#0ff2';
          context.fillRect(point.x * 10, point.y* 10, 10, 10);
        });
      })
      context.fillStyle = "#0003";
      if (this.multiSelect){
        this.multiSelect.render(context, time, new Vector(0,0));
        //context.fillRect(this.multiStart.x, this.multiStart.y, -this.multiStart.x + this.cursor.x, -this.multiStart.y + this.cursor.y)
      }
    })
    for (let i =0; i< 40; i++){
      const round = new RoundNode();
      round.position = new Vector(Math.random()*800, Math.random()*600);
      round.color = "#f00";
      renderList.list.push(round);
    }
    //this.engine.rootNode.append(renderList);
    this.engine.start();
  }

  isEmptyTile(pos:Vector, unit:any){
    if (this.map.map[pos.y][pos.x]!=0) return false;
    let result = this.renderList.list.find(it=>{
      if (unit == it) return false;
      const near = (it as RoundNode).getTilePosition().sub(pos).abs();
      //if (near< 20){
       // console.log(near);
      //}
      return near<1;
    });
    return result == null;
  }
}

/*function test(){
  const renderList = new BaseNode();
  const physicList = new BaseNode();

  for (let i=0; i<10; i++){
    let node = new BaseNode();
    renderList.
  }
}*/

function inBox(point:Vector, _start:Vector, _end:Vector){
  const start = new Vector(Math.min(_start.x, _end.x), Math.min(_start.y, _end.y));
  const end = new Vector(Math.max(_start.x, _end.x), Math.max(_start.y, _end.y));
  return point.x>start.x && point.y>start.y && point.x<end.x && point.y<end.y;
}