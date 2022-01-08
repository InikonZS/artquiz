import Control from "../common/control";
import style from "./style.css";
import red from "./red.css";
import {Vector, IVector} from "../common/vector";
import {GameSide} from "./gameSidePanel";
import {MapObject, UnitObject, ITechBuild, InteractiveObject} from "./interactives";
import {BotPlayer} from "./botPlayer";
import { tech } from "./techTree";
import {GamePlayer, IBuildInfo} from "./gamePlayer";
import {TraceMap} from "./traceMap";
import {getMapFromImageData, getImageData, loadImage, findPath, indexateAsync, steps, tracePathes, inBox} from "./tracer";
import {InteractiveList} from "./interactiveList";
import {GameMap} from "./gameMap";
import {GameCursorStatus} from "./gameCursor";
import {consts} from "./globals";
import {makeCircleMap} from "./distance";

const view = [
  '00100'.split(''),
  '01110'.split(''),
  '11111'.split(''),
  '01110'.split(''),
  '00100'.split(''),
]

export class Game extends Control{
  player:GamePlayer;
  currentPlayer:number = 0;
  constructor(parentNode: HTMLElement, res: Record<string, HTMLImageElement>){
    super(parentNode, 'div', red['global_wrapper']);
    this.node.onmouseleave = (e)=>{
     // console.log(e.offsetX, e.offsetY);
      if (e.offsetX>this.node.clientWidth){
        field.map.currentMove = consts.moves[5]
      }
      if (e.offsetX<0){
        field.map.currentMove = consts.moves[3]
      }
      if (e.offsetY>this.node.clientHeight){
        field.map.currentMove = consts.moves[7]
      }
      if (e.offsetY<0){
        field.map.currentMove = consts.moves[1]
      }
    }
    this.node.onmouseenter = ()=>{
      field.map.currentMove = null;
    }
    this.node.oncontextmenu = e => e.preventDefault();
    /*window.onmousemove = ()=>{
      console.log('mv');
    }*/
    const head = new Control(this.node, 'div', red["global_header"]);
    const main = new Control(this.node, 'div', red["global_main"]);
    const field = new GameField(main.node, res);
    const player = new GamePlayer();
    const botPlayer = new BotPlayer(new Vector(20, 20));
    botPlayer.onBuild = (pos)=>{
      field.addObject(1, tech.builds.find(it=>it.name == 'barracs'), pos.x, pos.y);
    }

    botPlayer.onUnit = ()=>{
      field.addUnit(1, 'csu');
    }

    //botPlayer.

    botPlayer.onAttack = ()=>{
      //let botUnits = field.units.filter(it=>it.player==1);
      let playerBuilds = field.objects.list.filter(it=>it.player==0);
      if (playerBuilds.length == 0) return;
      /*botUnits.forEach(it=>{
        if (it.attackTarget.health<=0){
          it.attackTarget = null;
        }
      })*/
      //if (botUnits.length ==0) return;
      //botUnits[Math.floor(Math.random()* botUnits.length)].attackTarget = playerBuilds[Math.floor(Math.random()* playerBuilds.length)];
    }
    

    //const side = new GameSide(main.node);
    //player.getAvailableBuilds();
    
    const side = new GameSide(main.node, player);
    side.onBuildSelect = (name, callback)=>{
      //field.setMode(1, name.desc[0], callback);
      field.setPlanned(name.desc[0], callback);
    }
    side.onUnitReady = (name:string)=>{
      field.addUnit(0, name);
    }
  }
}



export class GameField extends Control{
  cursor: { x: number; y: number; } = {x:0, y:0};
  map:GameMap;
  sz:number = 55;
  canvas: Control<HTMLCanvasElement>;
  objects: InteractiveList;//MapObject[]=[];
  modeCallback: () => void;
  primaries: Array<Record<string, MapObject>> =[{},{}];
  res: Record<string, HTMLImageElement>;
  cursorStatus:GameCursorStatus 
  pathes: Vector[][];

  constructor(parentNode: HTMLElement, res: Record<string, HTMLImageElement>){
    super(parentNode, 'div', red['game_field']);
    this.res = res;  
    
    const canvas = new Control<HTMLCanvasElement>(this.node, 'canvas');
    this.canvas = canvas;
    this.map = new GameMap(96, 96, res['map'], res);
    
    this.cursorStatus= new GameCursorStatus(()=>{
      return this.primaries[0];
    });
    this.objects = new InteractiveList();
    this.objects.onChangeHovered = ((last, current)=>{
      this.cursorStatus.hovered = current?[current]:[];
    });

    this.objects.onClick = (current=>{
      this.cursorStatus.selected = current?[current]:[];
    });

    let preventSelect = false;
    canvas.node.onmousedown =e=>{
      if (e.button == 2){
        this.cursorStatus.planned = null;
        this.cursorStatus.selected = [];
      } else if (e.button == 0){
        if (this.cursorStatus.getAction()!='select') return;
        this.handleMultiselect(this.getPixelCursor(), ()=>{
          preventSelect = true;
        });
      }
    }

    canvas.node.onmousemove=e=>{
      this.cursor.x = e.clientX;
      this.cursor.y = e.clientY;
     // if (!this.cursorStatus.multiStart){
        const tile = this.getTileCursor();
        const cursor = this.getPixelCursor();
        this.objects.handleMove(tile, cursor);
        this.cursorStatus.pixelPosition = Vector.fromIVector(this.cursor);
        this.cursorStatus.tilePosition = tile;
      //}
    }
    
    canvas.node.onclick=e=>{
      if (preventSelect){
        preventSelect = false;
        return;
      }
      const cursorTile = this.getTileCursor();
      const cursor = this.getPixelCursor();
      const action = this.cursorStatus.getAction();
      if (action == 'select'){
        this.objects.handleClick(cursorTile, cursor);
      } else if (action == 'move'){
        this.commandUnit();
      } else if (action == 'build'){
        this.modeCallback();
        this.addObject(0, this.cursorStatus.planned, cursorTile.x, cursorTile.y); 
        this.cursorStatus.planned = null; 
      } else if (action == 'primary'){
        this.primaries[0][this.cursorStatus.hovered[0].name] = this.cursorStatus.hovered[0] as MapObject;
      }
    }

    this.autoSizeCanvas();
    const ctx = canvas.node.getContext('2d');

    let lastTime:number =null;
    const render=()=>{
      requestAnimationFrame((timeStamp)=>{
        if (!lastTime){
          lastTime = timeStamp;
        }

        this.render(ctx, timeStamp - lastTime);
        lastTime = timeStamp;
        render();
      })
      
    }
    render();
    window.addEventListener('resize', ()=>{
      this.autoSizeCanvas();
    })
  }

  handleMultiselect(start:Vector, onSelect:()=>void){
    this.cursorStatus.multiStart = start; //new Vector(e.clientX, e.clientY);
    let listener = ()=>{
      
      let selection = this.objects.list.filter(it=>{
        if ((it instanceof UnitObject) == false){
          return false;
        }
        return it.player == 0 && inBox((it as UnitObject).positionPx, this.cursorStatus.multiStart,  this.getPixelCursor());
      });
      
      this.cursorStatus.multiStart = null;
      window.removeEventListener('mouseup', listener);
      if (selection.length){
        this.cursorStatus.selected = selection;
        onSelect();
      }
    }
    window.addEventListener('mouseup', listener);
  }

  getTraceMap(){
    //add builds on map;
    return this.map.map.map(it=>it.map(jt=>jt==0?Number.MAX_SAFE_INTEGER:-1));
  }

  commandUnit(){
    let traceMap = this.getTraceMap();
    let indexPoint = this.getTileCursor();//{x:Math.floor(e.offsetX/this.sz), y:Math.floor(e.offsetY/this.sz)};
    //console.log(this.selected);
    if (!this.cursorStatus.isOnlyUnitsSelected()){
      return;
    }
    const units:UnitObject[] = this.cursorStatus.selected as UnitObject[];//[this.selected as UnitObject];
    const destinations = units.map(unit=>{
      return new Vector(Math.floor(unit.positionPx.x/this.sz), Math.floor(unit.positionPx.y/this.sz))
    });
    //[...this.mainSlot.list];
    tracePathes(traceMap, indexPoint, destinations, (pathes)=>{
      this.pathes = pathes;
      console.log(pathes);
      pathes.forEach((path, i)=>{
        const unit = units[i];
        (unit as UnitObject).setPath(path, (pos)=>this.isEmptyTile(pos, unit));
        //(unit as RoundNode).attackTarget = Vector.fromIVector(indexPoint).scale(10);
      })
    })  
  }

  getPrimary(player:number, name:string){
    return Object.values(this.primaries[player]).find(it=>it.name == name) || null;
  }

//возможно, тут лучше передвать не нейм, а сам объект созданного солдата? 
  addUnit(player:number, name:string){
    //TODO check is empty,else, check neighbor
  //  console.log(name);
    let unit = new UnitObject();
    unit.player = player;
    //unit.position = new Vector(20, 20); //for demo
    const spawn = tech.units.filter(item => item.name == name)[0].spawn[0];
    
    let barrac = this.getPrimary(player, spawn);//Object.values(this.primaries[player]).find(it=>it.name == spawn);
    if (barrac){
      unit.positionPx = Vector.fromIVector({x:barrac.position.x*this.sz, y: barrac.position.y*this.sz});
    } 
    
    unit.name = name;
    this.objects.add(unit);
  }

  /*addMtx(obj:Array<Array<string>>, x: number, y:number, pivot:Vector){
    //console.log(x, y);
    for(let i = 0; i < obj.length; i++){
      for(let j = 0; j < obj[0].length; j++){
        if (obj[j][i] == '1'){
          if (this.map[i+x-pivot.x] && this.map[i+x-pivot.x][j+y-pivot.y]!=null){
            this.map[i+x-pivot.x][j+y-pivot.y] = 2;
          }
        }
      }
    }
  }*/

  setPlanned(name:string, callback:()=>void){
    //this.mode = mode;
    console.log(name);
    this.cursorStatus.planned = tech.builds.find(it=>it.desc[0] == name);//{name:name};
    console.log(callback);
    this.modeCallback = callback;
  }

  addObject(player:number, obj:ITechBuild, x:number, y:number){
    let object = new MapObject(obj, this.res);
    object.position = new Vector(x,y);
    object.player = player;
    if (this.primaries[player][object.name]==null){
      this.primaries[player][object.name] = object;
    } 

    this.objects.add(object);
    //this.traceMap.addObjectData(object)
  }

  renderObjects(ctx:CanvasRenderingContext2D){
    this.objects.list.forEach(it=>{
      it.render(ctx, 
        this.map.position, 
        this.sz, 
        this.cursorStatus.selected.includes(it),
        Object.keys(this.primaries[0]).find(obj=>this.primaries[0][obj]==it)!=null
      );
    });
  }

  renderMtx(ctx:CanvasRenderingContext2D, obj:Array<Array<string>>, px:number, py:number){
    let sz = this.sz;
    //this.cursorTile.x = Math.floor((this.position.x % sz +Math.floor(this.cursor.x/sz)*sz)/sz);
    //this.cursorTile.y = Math.floor((this.position.y % sz +Math.floor(this.cursor.y/sz)*sz)/sz);
    for(let i = 0; i < 4; i++){
      for(let j = 0; j < 4; j++){
        if (obj[j][i] == '1'){
        /*ctx.fillStyle = "#ff09";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        ctx.rect(px+0 +i*sz, py+0+j*sz, sz, sz);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();*/
        //this.drawTile(ctx, new Vector(i, j), new Vector(px, py), '#ff09');
        }
        //ctx.strokeText(i.toString() + ' / '+ j.toString(), this.position.x+0 +i*sz, this.position.y+0+j*sz)
        //ctx.drawImage(this.tile, this.position.x+0 +i*sz, this.position.y+0+j*sz, sz, sz);
      }
    }
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

  getVisibleTileRect(){
    let sz = this.sz;
    let canvasSize = this.getCanvasSize();
    const minx = Math.floor((-this.map.position.x+0)/sz);
    const maxx = Math.floor((-this.map.position.x+canvasSize.width+sz)/sz);
    const miny = Math.floor((-this.map.position.y+0)/sz);
    const maxy = Math.floor((-this.map.position.y+canvasSize.height+sz)/sz);
    return {minx, maxx, miny, maxy};
  }

  getTileCursor(){
    return Vector.fromIVector({
      x: Math.floor((-this.map.position.x +this.cursor.x)/this.sz),
      y: Math.floor((-this.map.position.y +this.cursor.y)/this.sz)
    });
  }

  getPixelCursor(){
    return Vector.fromIVector({
      x: -this.map.position.x + this.cursor.x,
      y: -this.map.position.y + this.cursor.y
    });
  }
  
  toMapPixelVector(vector:IVector):IVector{
    return {
      x: this.map.position.x + vector.x,
      y: this.map.position.y + vector.y,
    }
  }

  getCanvasSize(){
    return {
      width: this.canvas.node.width,
      height: this.canvas.node.height
    }
  }

  autoSizeCanvas(){
    this.canvas.node.width = this.node.clientWidth;
    this.canvas.node.height = this.node.clientHeight;
  }

  render(ctx: CanvasRenderingContext2D, delta:number){
    this.map.renderMap(ctx, this.getCanvasSize(), this.getVisibleTileRect(), this.getTileCursor());
    this.renderObjects(ctx);
    this.cursorStatus.render(ctx, this.map.position);

    if (this.pathes){
      this.pathes.forEach(it=>{
        it.forEach(jt=>{
          this.drawTile(ctx, jt, this.map.position, '#0006');
        });
      })
    }

    //no optimal
    this.objects.list.forEach(it=>{
      if (it.player != 0 ) return;
      if (it instanceof UnitObject){
        this.map.renderMtx(makeCircleMap(3), it.position.x, it.position.y);
      } else {
        this.map.renderMtx(makeCircleMap(5), it.position.x, it.position.y);  
      }
    })

    //this.renderMtx(ctx, obj, this.position.x+0 +cursorTile.x*sz, this.position.y+0+cursorTile.y*sz);/*this.position.x % sz +Math.floor(this.cursor.x/sz)*sz, this.position.y % sz +Math.floor(this.cursor.y/sz)*sz*/
  }


  isEmptyTile(pos:Vector, unit:any){
    if (this.map.map[pos.y][pos.x]!=0) return false;
    return true;
    /*let result = this.renderList.list.find(it=>{
      if (unit == it) return false;
      const near = (it as RoundNode).getTilePosition().sub(pos).abs();
      //if (near< 20){
       // console.log(near);
      //}
      return near<1;
    });
    return result == null;*/
  }
}