import Control from "../common/control";
import style from "./style.css";
import red from "./red.css";
import {Vector, IVector} from "../common/vector";

const obj = [
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
  ['ms', obj],
  ['cs', obj1],
  ['tc', obj2]
])

class GameSide extends Control{
  onBuildSelect: (name:string, clearFunc:()=>void)=>void;
  onUnitReady: (name:string)=>void;

  constructor(parentNode: HTMLElement){
    super(parentNode, 'div', red['game_side']);
    const radar = new Control(this.node, 'div', red["game_radar"]);
    const builds = new Control(this.node, 'div', red["game_builds"]);
    const buildTools = new Control(builds.node, 'div', red["builds_tool"]);
    const buildItems = new Control(builds.node, 'div', red["builds_items"]);
    const buildingsW = new Control(buildItems.node, 'div', red["builds_column"]);
    const buildings = new Control(buildingsW.node, 'div', red["column_items"]);
    const blds = ['ms', 'cs', 'tc'];
    blds.forEach((it, i)=>{
      const build = new Control(buildings.node, 'div', red["builds_item"], it);
      let isBuilding = false;
      let isBuilded = false;
      let progress = 0;
      build.node.onclick = ()=>{
        if (isBuilded == false && isBuilding ==false){
          isBuilding = true;
          let intId = setInterval(()=>{
            progress+=0.1;
            build.node.textContent = `${it} - ${(progress*100).toFixed(0)} / 100`;
            if (progress >= 1){
              progress = 1;
              build.node.textContent = `${it} - ready`;
              isBuilded = true;
              isBuilding = false;
              clearInterval(intId);
            }
          }, 300);
        }
        if (isBuilded){
          this.onBuildSelect(it, ()=>{
            isBuilded = false; 
            progress = 0;
            build.node.textContent = it;
          });
        }
      }
    });
    
    const unitsW = new Control(buildItems.node, 'div', red["builds_column"]);
    const units = new Control(unitsW.node, 'div', red["column_items"]);
    const uns = ['msu', 'csu', 'tcu', 'asd'];
    uns.forEach(it=>{
      const unit = new Control(units.node, 'div', red["builds_item"], it);
      let isBuilding = false;
      //let isBuilded = false;
      let progress = 0;
      unit.node.onclick = ()=>{
        if (isBuilding ==false){
          isBuilding = true;
          let intId = setInterval(()=>{
            progress+=0.1;
            unit.node.textContent = `${it} - ${(progress*100).toFixed(0)} / 100`;
            if (progress >= 1){
              progress = 0;
              unit.node.textContent = it;//`${it} - ready`;
              //isBuilded = true;
              isBuilding = false;
              this.onUnitReady(it);
              clearInterval(intId);
            }
          }, 300);
        }  
      }
    });
  } 
}

export class Game extends Control{
  constructor(parentNode: HTMLElement){
    super(parentNode, 'div', red['global_wrapper']);
    const head = new Control(this.node, 'div', red["global_header"]);
    const main = new Control(this.node, 'div', red["global_main"]);
    const field = new GameField(main.node);
    const side = new GameSide(main.node);
    side.onBuildSelect = (name, callback)=>{
      field.setMode(1, name, callback);
    }
    side.onUnitReady = (name:string)=>{
      field.addUnit(name);
    }
  }
}

class MapObject{
  position: {x:number, y:number};
  tiles: Array<Array<number>>;
  sprite: HTMLImageElement;
  constructor(){

  }
}

class UnitObject{
  position: {x:number, y:number};
  constructor(){

  }
}

export class GameField extends Control{
  currentMove: {x:number, y:number};
  position: { x: number; y: number; } = {x:0, y:0};
  cursor: { x: number; y: number; } = {x:0, y:0};
  //cursorTile: { x: number; y: number; } = {x:0, y:0};
  tile: HTMLImageElement;
  map:Array<Array<number>>;
  sz:number = 55;
  canvas: Control<HTMLCanvasElement>;
  objects: MapObject[]=[];
  units: UnitObject[]=[];
  mode: number = 0;
  currentBuilding: string[][];
  modeCallback: () => void;
  constructor(parentNode: HTMLElement){
    super(parentNode, 'div', red['game_field']);
    const canvas = new Control<HTMLCanvasElement>(this.node, 'canvas');
    this.canvas = canvas;
    this.map = [];
    for(let i = 0; i < 96; i++){
      let row = [];
      for(let j = 0; j < 96; j++){
        row.push(1);
      }
      this.map.push(row);
    }
    
    //const overlay = new Control(this.node, 'div', style['bounds']);

    /*window.onmousemove =(e:MouseEvent)=>{
      console.log(e.clientX);
    }*/
    const moves = [
      {x:-1, y:-1},
      {x:0, y:-1}, 
      {x:1, y:-1},

      {x:-1, y:0}, 
      null,
      {x:1, y:0},

      {x:-1, y:1}, 
      {x:0, y:1},
      {x:1, y:1}, 
    ];
    canvas.node.onmousemove=e=>{
      this.cursor.x = e.clientX;
      this.cursor.y = e.clientY;
      //this.cursor.x+=e.movementX;
      //this.cursor.y+=e.movementY;
    }
    
    canvas.node.onclick=e=>{
      let sz=55;
      console.log('d');
      //overlay.node.requestPointerLock();
      const cursorTile = this.getTileCursor();
      //this.addMtx(obj, cursorTile.x, cursorTile.y);
      if (this.mode == 1){
        this.addObject(this.currentBuilding, cursorTile.x, cursorTile.y);
        this.modeCallback();
        this.setMode(0, null, null);
      }
    }
    document.body.onmouseleave = ()=>{
      console.log('df');
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

    this.tile = new Image();
    this.tile.src = "./public/img/pictures/0.jpg";
    this.tile.onload = ()=>{
      render()
    }

    const render=()=>{
      requestAnimationFrame(()=>{
        if (this.currentMove){
          this.position.x -= this.currentMove.x*10;
          this.position.y -= this.currentMove.y*10;
        }
        if (-this.position.x<-55*0) {
          this.position.x = 55*0;
        }
        if (-this.position.y<-55*0) {
          this.position.y = 55*0;
        }
        if (-this.position.x+800>this.map.length*this.sz) {
          this.position.x = -this.map.length*this.sz+800;
        }
        if (-this.position.y+600>this.map[0].length*this.sz) {
          this.position.y = -this.map[0].length*this.sz+600;
        }
        
        this.render(ctx);

        render();
      })
    }
     
    window.addEventListener('resize', ()=>{
      this.autoSizeCanvas();
    })
  }

  addUnit(name:string){
    console.log(name);
    let unit = new UnitObject();
    unit.position = new Vector(20, 20);
    this.units.push(unit);
  }

  addMtx(obj:Array<Array<string>>, x: number, y:number){
    console.log(x, y);
    for(let i = 0; i < 4; i++){
      for(let j = 0; j < 4; j++){
        if (obj[j][i] == '1'){
          this.map[i+x][j+y] = 2;
        }
      }
    }
  }

  setMode(mode:number, name:string, callback:()=>void){
    this.mode = mode;
    this.currentBuilding = buildMap.get(name);
    this.modeCallback = callback;
  }

  addObject(obj:Array<Array<string>>, x:number, y:number){
    let object = new MapObject();
    object.tiles = obj.map(it=>it.map(jt=>parseInt(jt)));
    object.position = new Vector(x,y);
    this.objects.push(object);
  }

  renderObjects(ctx:CanvasRenderingContext2D){
    this.objects.forEach(it=>{
      this.drawObject(ctx, it.tiles, it.position, this.position, "#ff49");
    });
  }

  renderUnits(ctx:CanvasRenderingContext2D){
    this.units.forEach(it=>{
      this.drawUnit(ctx, it.position, this.position, "#0ff9");
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
        this.drawTile(ctx, new Vector(i, j), new Vector(px, py), '#ff09');
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

  drawUnit(ctx:CanvasRenderingContext2D, position:IVector, camera:IVector, color:string){
    const sz = 10;
    ctx.fillStyle = color;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(camera.x + position.x, camera.y+ position.y, sz, sz, 0, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  renderMap(ctx: CanvasRenderingContext2D){
    ctx.fillStyle="#000";
    const canvasSize = this.getCanvasSize();
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    const obi:Array<string> = [
      "#fff",
      "#f00",
      "#ff0"
    ]
    const sz = this.sz;
    const {minx, maxx, miny, maxy} = this.getVisibleTileRect();
    for(let i = minx; i < maxx; i++){
      for(let j = miny; j < maxy; j++){
        if (this.map[i] && this.map[i][j]){
          ctx.fillStyle = obi[this.map[i][j]];
          const cursorTile = this.getTileCursor();
          if (i === cursorTile.x && j === cursorTile.y){
            ctx.fillStyle = "#0ff9";
          }
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1;
          ctx.beginPath();
          
          ctx.rect(this.position.x+0 +i*sz, this.position.y+0+j*sz, sz, sz);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.strokeText(i.toString() + ' / '+ j.toString(), this.position.x+0 +i*sz, this.position.y+0+j*sz)
        }
        //ctx.drawImage(this.tile, this.position.x+0 +i*sz, this.position.y+0+j*sz, sz, sz);
      }
    }
  }

  getVisibleTileRect(){
    let sz = this.sz;
    let canvasSize = this.getCanvasSize();
    const minx = Math.floor((-this.position.x+0)/sz);
    const maxx = Math.floor((-this.position.x+canvasSize.width+sz)/sz);
    const miny = Math.floor((-this.position.y+0)/sz);
    const maxy = Math.floor((-this.position.y+canvasSize.height+sz)/sz);
    return {minx, maxx, miny, maxy};
  }

  getTileCursor(){
    return {
      x: Math.floor((-this.position.x +this.cursor.x)/this.sz),
      y: Math.floor((-this.position.y +this.cursor.y)/this.sz)
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

  render(ctx: CanvasRenderingContext2D){
    let sz = this.sz;
    //this.cursorTile.x = ;
    //this.cursorTile.y = Math.floor((-this.position.y +this.cursor.y)/sz);

    this.renderMap(ctx);
    this.renderObjects(ctx);
    this.renderUnits(ctx);

    ctx.fillStyle = "#00f";
    ctx.beginPath();
    ctx.ellipse(this.cursor.x -5, this.cursor.y-5, 10, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();  

    const cursorTile = this.getTileCursor();
    if (this.mode==1){
      this.drawObject(ctx, this.currentBuilding, cursorTile, this.position, "#ff06");
    }
    //this.renderMtx(ctx, obj, this.position.x+0 +cursorTile.x*sz, this.position.y+0+cursorTile.y*sz);/*this.position.x % sz +Math.floor(this.cursor.x/sz)*sz, this.position.y % sz +Math.floor(this.cursor.y/sz)*sz*/
  }
}