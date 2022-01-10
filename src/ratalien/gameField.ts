import Control from "../common/control";
import red from "./red.css";
import {Vector, IVector} from "../common/vector";
import {MapObject, UnitObject, ITechBuild, InteractiveObject, Tower} from "./interactives";
import { tech } from "./techTree";
import {GamePlayer, IBuildInfo} from "./gamePlayer";
import {getMapFromImageData, getImageData, loadImage, findPath, indexateAsync, steps, tracePathes, inBox} from "./tracer";
import {InteractiveList} from "./interactiveList";
import {GameMap} from "./gameMap";
import {GameCursorStatus} from "./gameCursor";
import {makeCircleMap, findClosestBuild} from "./distance";
import {generateEmptyMap} from "./tracer";
import {SolderUnit} from "./units/SolderUnit";
import {TruckUnit} from "./units/TruckUnit";
import { IUnitConstructor } from "./units/IUnitConstructor";

export class GameField extends Control{
  cursor: { x: number; y: number; } = {x:0, y:0};
  map:GameMap;
  sz:number = 55;
  canvas: Control<HTMLCanvasElement>;
  objects: InteractiveList;//MapObject[]=[];
  modeCallback: () => void;
  //primaries: Array<Record<string, MapObject>> =[{},{}];
  res: Record<string, HTMLImageElement>;
  cursorStatus:GameCursorStatus 
  pathes: Vector[][];
  players: GamePlayer[];
  fps: number;

  constructor(parentNode: HTMLElement, res: Record<string, HTMLImageElement>, players:GamePlayer[]){
    super(parentNode, 'div', red['game_field']);
    this.res = res;  
    this.players = players;
    
    const canvas = new Control<HTMLCanvasElement>(this.node, 'canvas');
    this.canvas = canvas;
    this.map = new GameMap(96, 96, res['map'], res);
    
    this.cursorStatus= new GameCursorStatus(()=>{
      return this.players[0].primaries;
    },
    ()=>{
      return this.getBuildMap();
    },
    ()=>this.map.map);
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
        this.players[0].primaries[this.cursorStatus.hovered[0].name] = this.cursorStatus.hovered[0] as MapObject;
      } else if (action == 'attack'){
        this.commandUnit(cursor.clone());
      } else if (action == 'gold'){
        this.commandUnit(cursor.clone());
      } else if (action == 'cash_in'){
        this.commandUnit(cursor.clone());
      }
    }

    this.autoSizeCanvas();
    const ctx = canvas.node.getContext('2d');

    let lastTime:number =null;
    this.fps = 60;
    const render=()=>{
      requestAnimationFrame((timeStamp)=>{
        if (!lastTime){
          lastTime = timeStamp;
        }

        const delta = timeStamp - lastTime;
        const dv =  16;
        if (this.fps>60){
          this.fps = 60
        }
        this.fps = ((this.fps * (dv-1)) + (1 / delta * 1000))/dv;
        this.render(ctx, delta);
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
    //generateEmptyMap(96, 96, 0);
    let map = this.map.map.map(it=>it.map(jt=>jt));
    this.objects.list.forEach(it=>{
      if (it instanceof MapObject){
        //console.log(it.tiles);
        this.map.renderMtx(map, it.tiles.map(ii=>ii.map(jj=>jj.toString())), it.position.x, it.position.y, 'corner');
      }
    })
    return map.map(it=>it.map(jt=>jt==0?Number.MAX_SAFE_INTEGER:-1));
  }

  getBuildMap(){
    //add builds on map;
    //generateEmptyMap(96, 96, 0);
    let map = this.map.map.map(it=>it.map(jt=>jt));
    this.objects.list.forEach(it=>{
      if (it instanceof MapObject){
       // console.log(it.tiles);
        this.map.renderMtx(map, it.tiles.map(ii=>ii.map(jj=>jj.toString())), it.position.x, it.position.y, 'corner');
      }
    })
    return map.map(it=>it.map(jt=>jt==0?0:1));
  }

  commandUnit(attackPoint:Vector = null){
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
        (unit as UnitObject).setPath(path, (pos)=>this.isEmptyTile(pos, unit), attackPoint);
        //(unit as RoundNode).attackTarget = Vector.fromIVector(indexPoint).scale(10);
      })
    })  
  }

  getPrimary(player:number, name:string){
    return Object.values(this.players[player].primaries).find(it=>it.name == name) || null;
  }

  isPrimary(player:number, build:InteractiveObject){
    return Object.values(this.players[player].primaries).find(it=>it == build) != null;
  }

//возможно, тут лучше передвать не нейм, а сам объект созданного солдата? 
  addUnit(player:number, name:string){
    //TODO check is empty,else, check neighbor
  //  console.log(name);
    let unitMap:Record<string, IUnitConstructor> = {'solder':SolderUnit, 'truck':TruckUnit};
    let UnitConstructor = unitMap[name] || UnitObject;
    let unit = new UnitConstructor();//UnitObject();
    unit.onDamageTile = (point)=>{
      const damaged = this.map.toTileVector(point);//new Vector(Math.floor(point.x / 55), Math.floor(point.y / 55));
      if (this.map.getTileValue(damaged)){//this.map.map[damaged.y][damaged.x] == 1){
        if(unit.addGold(1000)){
          this.map.setTileValue(damaged, 0);///.map[damaged.y][damaged.x] = 0;
        }
      } else {
        let {distance, unit:build} = findClosestBuild(damaged, this.objects.list.filter(it=>it instanceof MapObject) as MapObject[]);
        console.log(distance, build);
        if (distance==0){
          if (build.player !=0){
            build.damage(10);
          } else {
            this.players[0].setMoney(this.players[0].money + unit.getGold());
            unit.clearGold();//unit.gold = 0;
          }
        }
      }
    }
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

  setPlanned(name:string, callback:()=>void){
    //this.mode = mode;
    console.log(name);
    this.cursorStatus.planned = tech.builds.find(it=>it.desc[0] == name);//{name:name};
    console.log(callback);
    this.modeCallback = callback;
  }

  addObject(player:number, obj:ITechBuild, x:number, y:number){
    let object = new Tower(obj, this.res);//MapObject(obj, this.res);
    object.getUnits = ()=>{
      return this.objects.list.filter(it=> it instanceof UnitObject && it.player!= player) as UnitObject[];
    }
    object.position = new Vector(x,y);
    object.player = player;
    if (this.players[player].primaries[object.name]==null){
      this.players[player].primaries[object.name] = object;
    } 

    this.objects.add(object);
    //this.traceMap.addObjectData(object)
  }

  renderObjects(ctx:CanvasRenderingContext2D, delta:number){
    this.objects.list.forEach(it=>{
      it.render(ctx, 
        this.map.position,
        delta,
        this.sz, 
        this.cursorStatus.selected.includes(it),
        this.isPrimary(0, it)//Object.keys(this.primaries[0]).find(obj=>this.primaries[0][obj]==it)!=null
      );
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
    ctx.fillStyle="#090";
    const canvasSize = this.getCanvasSize();
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    this.map.renderMap(ctx, this.getCanvasSize(), this.getVisibleTileRect(), this.getTileCursor(), this.map.position);
    this.renderObjects(ctx, delta);
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
        this.map.renderMtx(this.map.opened, makeCircleMap(3) /*['1111'.split(''),'1000'.split(''),'1000'.split(''),'0000'.split('')]*/, it.position.x, it.position.y, 'center');
      } else {
        this.map.renderMtx(this.map.opened, makeCircleMap(5), it.position.x, it.position.y, "center");  
      }
    })

    ctx.fillStyle = "#000";
    ctx.fillText('fps: '+this.fps.toFixed(2), 0, 30);

    //this.renderMtx(ctx, obj, this.position.x+0 +cursorTile.x*sz, this.position.y+0+cursorTile.y*sz);/*this.position.x % sz +Math.floor(this.cursor.x/sz)*sz, this.position.y % sz +Math.floor(this.cursor.y/sz)*sz*/
  }


  isEmptyTile(pos:Vector, unit:any){
    if (this.getBuildMap()[pos.y][pos.x]!=0) return false;
    //return true;
    let result = this.objects.list.find(it=>{
      if (unit == it) return false;
      const near = (it as UnitObject).position.clone().sub(pos).abs();
      //if (near< 20){
       // console.log(near);
      //}
      return near<1;
    });
    return result == null;
  }
}