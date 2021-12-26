import Control from "../common/control";
import style from "./style.css";
import red from "./red.css";
import {Vector, IVector} from "../common/vector";

const view = [
  '00100'.split(''),
  '01110'.split(''),
  '11111'.split(''),
  '01110'.split(''),
  '00100'.split(''),
]

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

export class Game extends Control{
  constructor(parentNode: HTMLElement){
    super(parentNode, 'div', red['global_wrapper']);
    this.node.onmouseleave = (e)=>{
      console.log(e.offsetX, e.offsetY);
      if (e.offsetX>this.node.clientWidth){
        field.currentMove = moves[5]
      }
      if (e.offsetX<0){
        field.currentMove = moves[3]
      }
      if (e.offsetY>this.node.clientHeight){
        field.currentMove = moves[7]
      }
      if (e.offsetY<0){
        field.currentMove = moves[1]
      }
    }
    this.node.onmouseenter = ()=>{
      field.currentMove = null;
    }
    /*window.onmousemove = ()=>{
      console.log('mv');
    }*/
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

class InteractiveObject{
  isHovered: boolean;
  onMouseMove: any;
  onMouseEnter: any;
  onMouseLeave: any;
  onClick: any;

  constructor(){

  }

  handleMove(tile:Vector){
    if (this.inShape(tile)){
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

  handleClick(e:Vector){
    if (this.inShape(e)){
      this.onClick?.(e);
    }
  }

  inShape(tile:Vector){
    return false;
  }
}

class MapObject extends InteractiveObject{
  position: {x:number, y:number};
  tiles: Array<Array<number>>;
  sprite: HTMLImageElement;
  health:number;
  name:string;

  constructor(){
    super();
    this.health = 100;
  }

  inShape(tile:Vector){
    let pos = tile.clone().sub(new Vector(this.position.x, this.position.y));
    if (this.tiles[pos.y] && this.tiles[pos.y][pos.x]!=null && this.tiles[pos.y][pos.x]!=0){
      return true;
    }
    return false;
  }

  damage(amount:number){
    this.health -=1;
  }
}

class UnitObject extends InteractiveObject{
  position: {x:number, y:number};
  target: Vector = null;
  speed: number = 1;
  attackRadius: number = 200;
  name:string;
  attackTarget: {damage:(amount:number)=>void} = null;
  constructor(){
    super();
  }

  inShape(tile:Vector){
    let pos = tile.clone().sub(new Vector(this.position.x, this.position.y));
    if (pos.abs()<15){
      return true;
    }
    return false;
  }

  step(){
    if (this.target){
      this.position = new Vector(this.position.x, this.position.y).add(new Vector(this.position.x, this.position.y).sub(this.target).normalize().scale(-this.speed));
      if (new Vector(this.position.x, this.position.y).sub(this.target).abs()<5){
        this.target = null;
      }
    } else {
      this.attack();
    }
  }

  attack(){
    if (this.attackTarget){
      console.log('atack');
      this.attackTarget.damage(1);
    }
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
  currentBuilding: {name:string, mtx:string[][]};
  selectedUnit: UnitObject = null;
  modeCallback: () => void;
  hoveredObject: MapObject[] =[];
  hoveredUnit: UnitObject[] = [];
  multiStart: Vector;
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
    /*const moves = [
      {x:-1, y:-1},
      {x:0, y:-1}, 
      {x:1, y:-1},

      {x:-1, y:0}, 
      null,
      {x:1, y:0},

      {x:-1, y:1}, 
      {x:0, y:1},
      {x:1, y:1}, 
    ];*/

    canvas.node.onmousedown =e=>{
      if (this.mode != 0) return;
      this.multiStart = new Vector(e.clientX, e.clientY);
      let listener = ()=>{
        this.multiStart = null;
        window.removeEventListener('mouseup', listener);
      }
      window.addEventListener('mouseup', listener);
    }

    canvas.node.onmousemove=e=>{
      this.cursor.x = e.clientX;
      this.cursor.y = e.clientY;
      
      if (!this.multiStart){
        const tile = this.getTileCursor()
        this.objects.forEach(it=>{
          it.handleMove(new Vector(tile.x, tile.y));
        });
        const cursor = this.getPixelCursor();
        this.units.forEach(it=>{
          it.handleMove(new Vector(cursor.x, cursor.y));
        });
      }
      //this.cursor.x+=e.movementX;
      //this.cursor.y+=e.movementY;
    }
    
    canvas.node.onclick=e=>{
      let sz=55;
      //console.log('d');
      //overlay.node.requestPointerLock();
      const cursorTile = this.getTileCursor();
      const cursor = this.getPixelCursor();
      //this.addMtx(obj, cursorTile.x, cursorTile.y);
      if (this.mode ==0){
        this.objects.forEach(it=>{
         // it.handleMove(new Vector(tile.x, tile.y));
          it.handleClick(new Vector(cursorTile.x, cursorTile.y));
        });
        this.units.forEach(it=>{
          it.handleClick(new Vector(cursor.x, cursor.y));
        });
        //return;
      } else
      if (this.mode == 1){
        this.addObject(this.currentBuilding, cursorTile.x, cursorTile.y);
        this.modeCallback();
        this.setMode(0, null, null);
        //return;
      } else

      if (this.mode == 2){
        this.mode = 0;
        this.selectedUnit.target= new Vector(cursor.x, cursor.y);
        this.selectedUnit.attackTarget = null;
        this.objects.forEach(it=>{
          // it.handleMove(new Vector(tile.x, tile.y));
           it.handleClick(new Vector(cursorTile.x, cursorTile.y));
         });
        this.selectedUnit = null;
        //return;
      }
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
  //  console.log(name);
    let unit = new UnitObject();
    unit.position = new Vector(20, 20);
    unit.name = name;
    unit.onClick = ()=>{
      this.selectedUnit = unit;
      this.mode = 2;
    }
    unit.onMouseEnter = ()=>{
      this.hoveredUnit.push(unit);
    }
    unit.onMouseLeave = ()=>{
      this.hoveredUnit = this.hoveredUnit.filter(it=>it!=unit);
    }
    this.units.push(unit);
  }

  addMtx(obj:Array<Array<string>>, x: number, y:number, pivot:Vector){
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
  }

  setMode(mode:number, name:string, callback:()=>void){
    this.mode = mode;
    this.currentBuilding = {name:name, mtx:buildMap.get(name)};
    this.modeCallback = callback;
  }

  addObject(obj:{name:string, mtx:Array<Array<string>>}, x:number, y:number){
    let object = new MapObject();
    object.tiles = obj.mtx.map(it=>it.map(jt=>parseInt(jt)));
    object.name = obj.name;
    object.position = new Vector(x,y);
    object.onClick = ()=>{
      //object.health -=1;
      console.log(object.name);
      if ( this.selectedUnit){
        console.log(this.selectedUnit);
        this.selectedUnit.attackTarget = object;
      }
    }
    object.onMouseEnter = ()=>{
      this.hoveredObject.push(object);
    }
    object.onMouseLeave = ()=>{
      this.hoveredObject = this.hoveredObject.filter(it=>it!=object);
    }
    this.objects.push(object);
  }

  renderObjects(ctx:CanvasRenderingContext2D){
    this.objects.forEach(it=>{
      this.drawObject(ctx, it.tiles, it.position, this.position, it.isHovered?"#9999":"#ff49");
      const pos = this.toMapPixelVector(new Vector(it.position.x*this.sz, it.position.y*this.sz));
      ctx.strokeText(`health: ${it.health.toString()}/100` , pos.x, pos.y +20);
      ctx.strokeText(it.name, pos.x, pos.y +35);
    });
  }

  renderUnits(ctx:CanvasRenderingContext2D){
    this.units.forEach(it=>{
      it.step();
      this.drawUnit(ctx, it.position, this.position, it.isHovered?"#9999":"#0ff9");
      this.addMtx(view,Math.floor(it.position.x/this.sz), Math.floor(it.position.y/this.sz), new Vector(2,2));
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
      "#0f0"
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

  getPixelCursor(){
    return {
      x: -this.position.x + this.cursor.x,
      y: -this.position.y + this.cursor.y
    }
  }
  
  toMapPixelVector(vector:IVector):IVector{
    return {
      x: this.position.x + vector.x,
      y: this.position.y + vector.y,
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
    let r =2;
    ctx.ellipse(this.cursor.x -r, this.cursor.y-r, r*2, r*2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke(); 
    // 
    let label = 'ground';
    if (this.hoveredUnit[this.hoveredUnit.length-1]){
       label = 'unit: '+this.hoveredUnit[this.hoveredUnit.length-1].name
    } else if(this.hoveredObject[this.hoveredObject.length-1]){
       label = 'build: '+this.hoveredObject[this.hoveredObject.length-1]?.name
    }
    ctx.fillText( label , this.cursor.x, this.cursor.y -10);

    let mode = 'select';
    if (this.mode ==1){
       mode = 'building'
    } else if(this.mode ==2 && this.hoveredObject[this.hoveredObject.length-1]){
       mode = 'atack'
    } else if(this.mode ==2){
      mode = 'move'
   } 

  /* if (this.multiStart){
     mode = "multiselect"
   }*/
   
    ctx.fillText( mode , this.cursor.x, this.cursor.y -20);
    
    
    if (this.multiStart){
      ctx.fillStyle = '#fff4';
      ctx.fillRect(this.multiStart.x, this.multiStart.y, this.cursor.x -this.multiStart.x, this.cursor.y -this.multiStart.y);
    }
    const cursorTile = this.getTileCursor();
    if (this.mode==1){
      this.drawObject(ctx, this.currentBuilding.mtx, cursorTile, this.position, "#ff06");
    }
    //this.renderMtx(ctx, obj, this.position.x+0 +cursorTile.x*sz, this.position.y+0+cursorTile.y*sz);/*this.position.x % sz +Math.floor(this.cursor.x/sz)*sz, this.position.y % sz +Math.floor(this.cursor.y/sz)*sz*/
  }
}