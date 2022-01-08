import { Vector } from "../common/vector";
import { getImageData, getMapFromImageData, generateEmptyMap } from "./tracer";

export class GameMap{
  map: Array<Array<number>>;
  opened: Array<Array<number>>;
  currentMove: Vector;
  position:Vector = Vector.fromIVector({x:0, y:0});
  cellSize: number = 55;
  res: Record<string, HTMLImageElement>;

  constructor(sizeX:number, sizeY:number, map:HTMLImageElement, textures:Record<string, HTMLImageElement>){
    this.map = [];
    this.res = textures;
    this.map = getMapFromImageData(getImageData(map));
    this.opened = generateEmptyMap(96,96, 0);
    //console.log(this.map);
    /*for(let i = 0; i < sizeY; i++){
      let row = [];
      for(let j = 0; j < sizeX; j++){
        row.push(1);
        //mapMap.set(`${i}-${j}`, 1)
      }
      this.map.push(row);
    }  */
  }

  render(){
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
    if (-this.position.x+800>this.map.length*this.cellSize) {
      this.position.x = -this.map.length*this.cellSize+800;
    }
    if (-this.position.y+600>this.map[0].length*this.cellSize) {
      this.position.y = -this.map[0].length*this.cellSize+600;
    }
  }

  renderMap(ctx:CanvasRenderingContext2D, canvasSize:any, visibleTileRect:any, cursorTile:any){
    this.render();
    ctx.fillStyle="#090";
    //const canvasSize = this.getCanvasSize();
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    const obi:Array<string> = [
      "#fff",
      "#f00",
      "#0f0"
    ]
    const sz = this.cellSize;
    const {minx, maxx, miny, maxy} = visibleTileRect;//this.getVisibleTileRect();
    for(let j = minx; j < maxx; j++){
      for(let i = miny; i < maxy; i++){
        if (this.map[i] && this.map[i][j]!==null){
          ctx.fillStyle = obi[this.map[i][j]];
          //const cursorTile = this.getTileCursor();
          /*if (i === cursorTile.x && j === cursorTile.y){
            ctx.fillStyle = "#0ff9";
          }*/
          ctx.strokeStyle = "#0005";
          ctx.lineWidth = 1;
          ctx.beginPath();
          
          ctx.rect(this.position.x+0 +j*sz, this.position.y+0+i*sz, sz, sz);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#0006';
          
          ctx.fillText(i.toString() + ' / '+ j.toString(), this.position.x+0 +j*sz, this.position.y+0+i*sz);
          if (this.opened[i][j]){
            ctx.drawImage(this.res['grass'], this.position.x+0 +j*sz, this.position.y+0+i*sz, sz, sz);
            if (this.map[i][j] == 2){
              ctx.drawImage(this.res['rocks'], this.position.x+0 +j*sz, this.position.y+0+i*sz - sz *0.5, sz, sz*1.5);
            }
            if (this.map[i][j] == 1){
              ctx.drawImage(this.res['gold'], this.position.x+0 +j*sz, this.position.y+0+i*sz - (this.res['gold'].naturalHeight - 128), sz, sz* this.res['gold'].naturalHeight / 128);
            }
            

          }
        }
        //ctx.drawImage(this.tile, this.position.x+0 +i*sz, this.position.y+0+j*sz, sz, sz);
      }
    }
  }

  renderMtx(obj:Array<Array<string>>, px:number, py:number){
    //let sz = this.sz;
    //this.cursorTile.x = Math.floor((this.position.x % sz +Math.floor(this.cursor.x/sz)*sz)/sz);
    //this.cursorTile.y = Math.floor((this.position.y % sz +Math.floor(this.cursor.y/sz)*sz)/sz);
    for(let i = 0; i < obj.length; i++){
      for(let j = 0; j < obj[0].length; j++){
        if (obj[j][i] == '1'){
          if (this.opened[py+j-Math.floor(obj.length/2)]){
            this.opened[py+j-Math.floor(obj.length/2)][px+i - Math.floor(obj[0].length/2)]=1;
          }
          
        }
      }
    }
  }
}