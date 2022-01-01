import Control from "../common/control";
import Signal from "../common/signal";
import {Vector, IVector} from "../common/vector";
import { InteractiveObject } from "./interactives";
import {getMapFromImageData, getImageData, loadImage, findPath, indexateAsync} from "./tracer";
import mpfile from './map96.png';

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
    ctx.ellipse(camera.x + this.position.x, camera.y+ this.position.y, sz, sz, 0, 0, Math.PI*2);
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

  setPath(path:Array<Vector>){
    this.path = [...path].reverse();
  }

  step(){
    if (this.target){
      this.position = this.position.clone().add(this.target.clone().sub(this.position).normalize().scale(2.5));
      if (this.position.clone().sub(this.target).abs()<=2.5){
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
  setPath:(path:Array<Vector>)=>void;
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
  constructor(){

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
    const sz = this.sz;
    ctx.fillStyle = color;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(camera.x + position.x * sz, camera.y+ position.y *sz, sz, sz);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
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
  constructor(parentNode:HTMLElement){
    super(parentNode, 'div');
    const canvas = new Control<HTMLCanvasElement>(this.node, 'canvas');
    canvas.node.width = 800;
    canvas.node.height = 600;
    const context = canvas.node.getContext('2d');
    this.engine = new Engine();
    const renderList = new RenderList();
    this.mainSlot = new MainSlot();
    const pathes:Array<Array<Vector>> = [];

    const map = new GameMap();
    map.loadFromFile(mpfile);

    canvas.node.onmousedown =e=>{
      console.log(e.button);
      if (e.button == 2) {
        let mp = map.map.map(it=>it.map(jt=>jt==0?Number.MAX_SAFE_INTEGER:-1));
        let indexPoint = {x:Math.floor(e.offsetX/10), y:Math.floor(e.offsetY/10)};
        indexateAsync(mp, [indexPoint], 0, ()=>{
          this.mainSlot.list.forEach(unit=>{
            //if (!indexPoint) { return;}
            let path = findPath(mp, Vector.fromIVector(indexPoint), new Vector(Math.floor(unit.position.x/10)*1, Math.floor(unit.position.y/10)*1));
            if (path){
              pathes.push(path.map(it=>it));
              unit.setPath(path);
              console.log(path);
            }
          });
        }, Date.now())
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
      pathes.forEach(it=>{
        it.forEach(point=>{
          context.fillStyle = '#0ff';
          context.fillRect(point.x * 10, point.y* 10, 10, 10);
        });
      })
      context.fillStyle = "#0003";
      if (this.multiSelect){
        this.multiSelect.render(context, time, new Vector(0,0));
        //context.fillRect(this.multiStart.x, this.multiStart.y, -this.multiStart.x + this.cursor.x, -this.multiStart.y + this.cursor.y)
      }
    })
    for (let i =0; i< 10; i++){
      const round = new RoundNode();
      round.position = new Vector(Math.random()*800, Math.random()*600);
      round.color = "#f00";
      renderList.list.push(round);
    }
    //this.engine.rootNode.append(renderList);
    this.engine.start();
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