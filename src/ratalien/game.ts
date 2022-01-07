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

const view = [
  '00100'.split(''),
  '01110'.split(''),
  '11111'.split(''),
  '01110'.split(''),
  '00100'.split(''),
]

/*const obj = [
  '0000'.split(''),
  '0110'.split(''),
  '1111'.split(''),
  '1111'.split(''),
]

const obj1 = [
  '0000'.split(''),
  '1100'.split(''),
  '1111'.split(''),
  '1111'.split(''),
]

const obj2 = [
  '0011'.split(''),
  '0011'.split(''),
  '1111'.split(''),
  '0011'.split(''),
]

const buildMap = new Map<string, Array<Array<string>>>([
  ['buildingCenter', obj],
  ['energyPlant', obj1],
  ['barracs', obj2],
  ['dogHouse', obj],
  ['oreFactoryBig', obj1],
  ['oreFactorySmall', obj2],
  ['carFactory', obj],
  ['energyCenter', obj1],
  ['defendTower', obj2],
  ['radar', obj1],
  ['repairStation', obj2],
  ['techCenter', obj]
])*/



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
  //currentMove: {x:number, y:number};
  //position: { x: number; y: number; } = {x:0, y:0};
  cursor: { x: number; y: number; } = {x:0, y:0};
  //cursorTile: { x: number; y: number; } = {x:0, y:0};
  //tile: HTMLImageElement;
//  selected: InteractiveObject;
  map:GameMap;
  sz:number = 55;
  canvas: Control<HTMLCanvasElement>;
  objects: InteractiveList;//MapObject[]=[];
  //units: UnitObject[]=[];
 // mode: number = 0;
 // currentBuilding: ITechBuild;
  //selectedUnit: UnitObject = null;
  modeCallback: () => void;
  //hoveredObject: {action:string, object:MapObject}[] =[];
  //hoveredUnit: UnitObject[] = [];
 // multiStart: Vector;
  //selectedBuild: MapObject;
  primaries: Array<Record<string, MapObject>> =[{},{}];
  private traceMap: TraceMap;
  private startUnitsPosition: number;
  action: string;
  res: Record<string, HTMLImageElement>;

  cursorStatus:GameCursorStatus = new GameCursorStatus;

  constructor(parentNode: HTMLElement, res: Record<string, HTMLImageElement>){
    super(parentNode, 'div', red['game_field']);
    this.res = res;
    this.objects = new InteractiveList();
    /* const getAction = (current:MapObject)=>{
        if ( this.selected instanceof UnitObject && current && current.player!==0){
          return 'attack'
        } else if(current && current instanceof MapObject && this.selected == current && current.player==0){
          return this.primaries[0][current.name] == this.selected? 'already_primary': 'set_primary';
        } else {
          return 'select_object'
        }
      }*/
    this.objects.onChangeHovered = ((last, current)=>{
      //console.log(last?.name, current?.name);
     /* if (current instanceof MapObject){
        this.action = getAction(current);
      }*/
      this.cursorStatus.hovered = current?[current]:[];
    });

    this.objects.onClick = (current=>{
      /*if ( this.selected instanceof UnitObject && current.player!==0){
        console.log(this.selected);
        //this.selectedUnit.attackTarget = current;
      } else if(current && this.selected instanceof MapObject && this.selected == current && current.player==0){
        this.primaries[0][this.selected.name] = this.selected;
      } else {
        //if (current instanceof MapObject){
        this.selected = current;
        if (current instanceof UnitObject){
          this.mode =2;
        } else {
          this.mode = 0;
        }
      }
      if (current instanceof MapObject){
        this.action = getAction(current);
      }*/

      this.cursorStatus.selected = current?[current]:[];
    });

    const canvas = new Control<HTMLCanvasElement>(this.node, 'canvas');
    this.canvas = canvas;
    this.traceMap = new TraceMap()
//    const mapMap: Map<string, number> = new Map();
    this.map = new GameMap(96, 96, res['map'], res);

//    this.traceMap.setMapData(mapMap)

    canvas.node.onmousedown =e=>{
      //if (this.mode != 0) return;
      this.cursorStatus.multiStart = new Vector(e.clientX, e.clientY);
      let listener = ()=>{
        this.cursorStatus.multiStart = null;
        window.removeEventListener('mouseup', listener);
      }
      window.addEventListener('mouseup', listener);

      if (e.button == 2){
        this.cursorStatus.planned = null;
        this.cursorStatus.selected = [];
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
        
       
      }
      //this.addMtx(obj, cursorTile.x, cursorTile.y);
      /*if (this.mode ==0){
        //this.objects.forEach(it=>{
          this.objects.handleClick(cursorTile, cursor);
        //});
        //this.units.forEach(it=>{
        //  it.handleClick(new Vector(cursor.x, cursor.y));
        //});
      } else
      if (this.mode == 1){
        this.addObject(0, this.currentBuilding, cursorTile.x, cursorTile.y);
        this.modeCallback();
        this.setMode(0, null, null);
      } else
      if (this.mode == 2 && this.selected instanceof UnitObject){
        this.mode = 0;
        this.commandUnit();
        //this.traceMap.setPathFinishPoint({x: cursorTile.x, y: cursorTile.y})

        //this.selectedUnit.target= new Vector(cursor.x, cursor.y);
        //this.selectedUnit.attackTarget = null;
        //this.objects.forEach(it=>{
           this.objects.handleClick(new Vector(cursorTile.x, cursorTile.y), this.getPixelCursor());
        // });
        this.selected = null;
      }*/
    }
    document.body.onmouseleave = ()=>{
     // console.log('df');
    }
    
    /*this.currentMove = null;
    this.position = {x:0, y:0};
    for(let i=0; i<9; i++){
      const bound = new Control(overlay.node, 'div', style['bound'+i.toString()]);
      bound.node.onmouseenter=()=>{
        this.currentMove = moves[i];
      }

    }*/
    //canvas.node.width = 800;
    //canvas.node.height = 600;
    this.autoSizeCanvas();
    const ctx = canvas.node.getContext('2d');

    /*this.tile = new Image();
    this.startUnitsPosition=1
    this.tile.src = "./public/img/pictures/0.jpg";
    this.tile.onload = ()=>{*/
      //render()
    //}

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

  commandUnit(){
    let mp = this.map.map.map(it=>it.map(jt=>jt==0?Number.MAX_SAFE_INTEGER:-1));
    let indexPoint = this.getTileCursor();//{x:Math.floor(e.offsetX/this.sz), y:Math.floor(e.offsetY/this.sz)};
    //console.log(this.selected);
    if (this.cursorStatus.selected.find(it=> !(it instanceof UnitObject)) != null){
      return;
    }
    const units:UnitObject[] = this.cursorStatus.selected as UnitObject[];//[this.selected as UnitObject];
    const destinations = units.map(unit=>{
      return new Vector(Math.floor(unit.positionPx.x/this.sz), Math.floor(unit.positionPx.y/this.sz))
    });
    //[...this.mainSlot.list];
    tracePathes(mp, indexPoint, destinations, (pathes)=>{
      //this.pathes = pathes;
      console.log(pathes);
      pathes.forEach((path, i)=>{
        const unit = units[i];
        (unit as UnitObject).setPath(path, (pos)=>this.isEmptyTile(pos, unit));
        //(unit as RoundNode).attackTarget = Vector.fromIVector(indexPoint).scale(10);
      })
    })  
  }
//возможно, тут лучше передвать не нейм, а сам объект созданного солдата? 
  addUnit(player:number, name:string){
    //TODO check is empty,else, check neighbor
  //  console.log(name);
    let unit = new UnitObject();
    //console.log(unit)
    unit.player = player;
    unit.position = new Vector(20, 20); //for demo
    const spawn = tech.units.filter(item => item.name == name)[0].spawn[0];
    
    let barrac = Object.values(this.primaries[player]).find(it=>it.name == spawn);
    if (barrac){
      unit.positionPx = Vector.fromIVector({x:barrac.position.x*this.sz, y: barrac.position.y*this.sz});
    } 
    
    
    unit.name = name;
    /*unit.onClick = ()=>{
      const cursorTile = this.getTileCursor();
      unit.clearStepIndex()
      this.traceMap.clearData()
      this.traceMap.activeUnitCoordinates(unit,cursorTile)
      console.log(this.units)
      this.selectedUnit = unit;
      this.mode = 2;

    }
    unit.onMouseEnter = ()=>{
      this.hoveredUnit.push(unit);
    }
    unit.onMouseLeave = ()=>{
      this.hoveredUnit = this.hoveredUnit.filter(it=>it!=unit);
    }

    this.units.push(unit);*/
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
      //if (it instanceof MapObject){
        it.render(ctx, 
          this.map.position, 
          this.sz, 
          this.cursorStatus.selected.includes(it),
          Object.keys(this.primaries[0]).find(obj=>this.primaries[0][obj]==it)!=null
        );
      /*}
      if (it instanceof UnitObject){
        it.render(ctx, 
          this.map.position
        );
      }*/
      //this.drawObject(ctx, it.tiles, it.position, this.map.position, it.isHovered?"#9999":colors[it.player]);
      /*const pos = this.toMapPixelVector(new Vector(it.position.x*this.sz, it.position.y*this.sz));
      ctx.strokeText(`health: ${it.health.toString()}/100` , pos.x, pos.y +10);
      ctx.strokeText(it.name, pos.x, pos.y +20);
      if (it==this.selectedBuild){
        ctx.strokeText('selected', pos.x, pos.y +30);
      }
      if (Object.keys(this.primaries[0]).find(obj=>this.primaries[0][obj]==it)){
        ctx.strokeText('primary', pos.x, pos.y +40);
      }*/
    });
  }

  /*renderUnits(ctx:CanvasRenderingContext2D, delta:number){
    this.units.forEach(it=>{
      it.step(delta,this.traceMap);
      it.render(ctx, this.map.position);
      //this.drawUnit(ctx, it.position, this.map.position, it.isHovered?"#9999": consts.colors[it.player]);
      //this.addMtx(view,Math.floor(it.position.x/this.sz), Math.floor(it.position.y/this.sz), new Vector(2,2));
    });
  }*/

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

  drawObject(ctx:CanvasRenderingContext2D, object:Array<Array<any>>, position:IVector, camera:IVector, color:string){
    object.forEach((row, i)=>row.forEach((cell, j)=>{
      if (object[i][j]!='0'){
        this.drawTile(ctx, new Vector(j+position.x, i+position.y), camera, color);
      }
    }));
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

  /*drawUnit(ctx:CanvasRenderingContext2D, position:IVector, camera:IVector, color:string){
    const sz = 10;
    ctx.fillStyle = color;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(camera.x + position.x, camera.y+ position.y, sz, sz, 0, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }*/

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

  // renderCursor(ctx:CanvasRenderingContext2D){
  //   ctx.fillStyle = "#00f";
  //   ctx.beginPath();
  //   let r =2;
  //   ctx.ellipse(this.cursor.x -r, this.cursor.y-r, r*2, r*2, 0, 0, Math.PI * 2);
  //   ctx.fill();
  //   ctx.stroke(); 
  //   // 
  //   let label = 'ground';
  //  /* if (this.hoveredUnit[this.hoveredUnit.length-1]){
  //      label = 'unit: '+this.hoveredUnit[this.hoveredUnit.length-1].name
  //   } else if(this.objects.hovered){
  //      label = 'build: '+this.objects.hovered?.name
  //   }*/
  //   ctx.fillText( label , this.cursor.x, this.cursor.y -10);

  // //   let mode = 'select';
  // //   if (this.mode ==1){
  // //      mode = 'building'
  // //   } else if(this.objects.hovered){
  // //      mode = this.action //'atack'
  // //   } else if(this.mode ==2){
  // //     mode = 'move'
  // //  } 
  //  ctx.fillText( 'mode' , this.cursor.x, this.cursor.y -20);
  //  this.drawTile(ctx, this.getTileCursor(), this.map.position, "#0ff7");
  // }

  // renderMulti(ctx: CanvasRenderingContext2D){
  //   ctx.fillStyle = '#fff4';
  //   ctx.fillRect(this.cursorStatus.multiStart.x, this.cursorStatus.multiStart.y, this.cursor.x -this.cursorStatus.multiStart.x, this.cursor.y -this.cursorStatus.multiStart.y);
  // }

  renderBuildPlanned(ctx: CanvasRenderingContext2D){
    const cursorTile = this.getTileCursor();
    //this.currentBuilding.render();
    this.drawObject(ctx, this.cursorStatus.planned.mtx, cursorTile, this.map.position, "#ff06");
  }

  render(ctx: CanvasRenderingContext2D, delta:number){
    //let sz = this.sz;
    //this.cursorTile.x = ;
    //this.cursorTile.y = Math.floor((-this.position.y +this.cursor.y)/sz);
    //this.renderMap(ctx);
    this.map.renderMap(ctx, this.getCanvasSize(), this.getVisibleTileRect(), this.getTileCursor());
    this.renderObjects(ctx);
    //this.renderUnits(ctx, delta);
    this.cursorStatus.renderCursor(ctx, this.map.position);

    if (this.cursorStatus.multiStart){
      this.cursorStatus.renderMulti(ctx);
    }
    if (this.cursorStatus.planned){
      this.renderBuildPlanned(ctx);
    }
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