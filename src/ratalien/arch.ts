import {Vector} from "../common/vector";
import Signal from "../common/signal";
import Control from "../common/control";
import {BaseNode, BaseListNode, InteractiveNode, IInteractive} from "./generic/nodes";

type IMap = Array<Array<number>>;
export class GameLauncher{
  constructor(){
    const canvas = new Control<HTMLCanvasElement>(document.body, 'canvas');
    const loader = new ResourceLoader();
    loader.load().then(resources=>{
      const renderer = new CanvasRenderer(canvas.node.getContext('2d'));
      renderer.start();
    });
  }
}

interface IRenderable extends BaseNode{
  render:(context:CanvasRenderingContext2D, camera:Camera)=>void;
}

class ResourceLoader{
  constructor(){

  }

  load(){
    return new Promise(resolve=>{
      resolve(this);
    })
  }
}
class Camera{
  public position: Vector;
  private speed: Vector;

  constructor(){

  }
}

class RenderList extends BaseListNode<IRenderable>{
  constructor(){
    super();
  }

  render(context:CanvasRenderingContext2D, camera:Camera){
    this.childs.forEach(it=>it.render(context, camera), camera);
  }
}

class InteractiveList extends BaseListNode<IInteractive>{
  constructor(){
    super();
  }

  handleMove(cursor:Vector){
    this.childs.forEach(it=>it.handleMove(cursor));
  }
}

interface ITickable extends BaseNode{
  tick(delta:number);
}

class TickList extends BaseListNode<ITickable>{
  constructor(){
    super();
  }

  tick(delta:number){
    this.childs.forEach(it=>it.tick(delta));
  }
}


class CanvasRenderer{
  ticker: MainTicker;
  tickList: TickList;
  renderList: RenderList;
  interactiveList: InteractiveList;
  camera: Camera;
  context: CanvasRenderingContext2D;

  constructor(context:CanvasRenderingContext2D){
    this.ticker = new MainTicker();
    this.renderList = new RenderList();

    this.context = context;
    this.camera = new Camera();
    this.ticker.onTick.add((delta:number)=>{
      this.tick(delta);
    });
    
    this.context.canvas.onmousemove = (ev)=>{
      this.interactiveList.handleMove(new Vector(ev.offsetX, ev.offsetY));
    }
  }

  private tick(delta:number){
    this.tickList.tick(delta);
    this.renderList.render(this.context, this.camera);

    this.renderList.handleChildDestroy();
    this.interactiveList.handleChildDestroy();
    this.renderList.handleChildDestroy();
  }

  start(){
    this.ticker.start();
  }

  stop(){
    this.ticker.stop();
  }

  addGameObject(object: BaseNode){
    if (typeof (object as IRenderable).render == 'function'){
      this.renderList.append(object as IRenderable);
    }
    if (typeof (object as ITickable).tick == 'function'){
      this.tickList.append(object as ITickable);
    }
    if (typeof (object as IInteractive).handleMove == 'function'){
      this.interactiveList.append(object as IInteractive);
    }
  }
}

class MainTicker{
  private lastFrameId: number;
  public onTick: Signal<number> = new Signal();
  private lastTime: number = null;

  constructor(){
  }

  start(){
    this.lastTime = Date.now();
    this.renderFrame();
  }

  stop(){
    cancelAnimationFrame(this.lastFrameId);
  }

  renderFrame(){
    this.lastFrameId = requestAnimationFrame((currentTime:number)=>{
      if (this.lastTime == null){
        this.lastTime = currentTime;
      }
      const deltaTime = currentTime - this.lastTime;
      this.onTick.emit(deltaTime);
      this.renderFrame();
    })
  }
}

class Player{
  name:string;
  isActive:boolean;
  onGameOver:()=>void;
  openedMap: IMap;
  money:number;
  onBuild: (node:BaseNode)=>void;
  units:Array<UnitNode>
  buildings:Array<BuildingNode>

  constructor(name:string){
    this.name = name;
  }

  build(){
    let node = new UnitNode();
    this.onBuild(node);
  }
}

class Game{
  players: Array<Player>;
  map: IMap;
  onFinish: ()=>void;
  renderer: CanvasRenderer;

  constructor(renderer:CanvasRenderer){
    this.renderer = renderer;
  }

  registerPlayer(name:string){
    let player = new Player(name);
    player.onBuild = (builtNode)=>{
      this.renderer.addGameObject(builtNode);
    }
  }
}

class UnitNode extends InteractiveNode implements IRenderable, ITickable, IInteractive{
  constructor(){
    super();
  }

  render(context: CanvasRenderingContext2D, camera: Camera){

  };

  tick(delta: number) {
    
  }

  inShape(cursor:Vector){
    return false;
  }

}

class BuildingNode extends InteractiveNode implements IRenderable, ITickable, IInteractive{
  constructor(){
    super();
  }

  render(context: CanvasRenderingContext2D, camera: Camera){

  };

  tick(delta: number) {
    
  }

  inShape(cursor:Vector){
    return false;
  }

}