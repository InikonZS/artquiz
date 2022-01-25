import { Vector } from "../common/vector";
import { getImageData, getMapFromImageData, generateEmptyMap, parseData } from "./tracer";

export class MiniMapGame {
  map: number[][];
  imageData: ImageData;
  opened: number[][];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  currentMove: Vector;
  position: Vector = Vector.fromIVector({ x: 0, y: 0 });
  cellSize: number = 2;
  constructor(map: HTMLImageElement) {
    this.map = [];
    this.imageData = getImageData(map);
    this.map = getMapFromImageData(this.imageData);
    this.opened = generateEmptyMap(map.naturalWidth, map.naturalHeight, 0);
    this.canvas = document.createElement('canvas');
    this.canvas.width = 200;
    this.canvas.height = 200;
    this.ctx = this.canvas.getContext('2d');
    // this.render();
    // this._renderMap(this.ctx);//, 0, 0, 0);
    // this.renderMap(this.ctx, 0, 0, 0);
    //console.log('map', this.map);
    //this.ctx.drawImage(map, 0, 0);
  }
//отрисовка экрана
  render(ctx: CanvasRenderingContext2D, sizeRect: any) { //камера - экран
    ctx.strokeStyle = "#0005";
    ctx.fillStyle = '#f36374';
    ctx.lineWidth = 1;
    // console.log('posX', this.position.x);
    // console.log('posY', this.position.y);
    // console.log('cur', this.currentMove);
    // console.log('mapL', this.map.length);
   // console.log(sizeRect.minx*2, sizeRect.miny*2, (sizeRect.maxx - sizeRect.minx)*2, (sizeRect.maxy - sizeRect.miny)*2);
    ctx.beginPath();
    ctx.rect(sizeRect.minx*2, sizeRect.miny*2, (sizeRect.maxx - sizeRect.minx)*2, (sizeRect.maxy - sizeRect.miny)*2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // if (this.currentMove){
    //   this.position.x -= this.currentMove.x*10;
    //   this.position.y -= this.currentMove.y*10;
    // }
    // if (-this.position.x<-this.cellSize*0) {
    //   this.position.x = this.cellSize*0;
    // }
    // if (-this.position.y<-this.cellSize*0) {
    //   this.position.y = this.cellSize*0;
    // }
    // if (-this.position.x+30>this.map.length*this.cellSize) {
    //   this.position.x = -this.map.length*this.cellSize+200;
    // }
    // if (-this.position.y+30>this.map[0].length*this.cellSize) {
    //   this.position.y = -this.map[0].length*this.cellSize+200;
    // }

  }

  renderMap(ctx: CanvasRenderingContext2D, bigCanvasSize: any, visibleTileRect: any, cursorTile: any, pos: Vector) {
    // console.log('bigCanvasSize', bigCanvasSize);
    // console.log('visibleTileRect', visibleTileRect);
    // console.log('cursorTile', cursorTile);
    // console.log('pos', pos);

    
    this._renderMap(ctx);//, canvasSize, visibleTileRect, cursorTile);
    this.render(ctx, visibleTileRect);
  }

//отрисовка деревьев, гор...
  _renderMap(ctx: CanvasRenderingContext2D) {//, canvasSize: any, visibleTileRect: any, cursorTile: any) {
    const obi: Array<string> = [
      "#fff",
      "#f00",
      "#0f0",
    ]
    const sz = this.cellSize;
    const field = { minx: 0, maxx: 96, miny: 0, maxy: 96 };// = visibleTileRect;//this.getVisibleTileRect();
    for (let j = field.minx; j < field.maxx; j++) {
      for (let i = field.miny; i < field.maxy; i++) {
        if (this.map[i] && this.map[i][j] !== null) {
          ctx.fillStyle = obi[this.map[i][j]];
          //const cursorTile = this.getTileCursor();
          /*if (i === cursorTile.x && j === cursorTile.y){
            ctx.fillStyle = "#0ff9";
          }*/
          // ctx.strokeStyle = "#0005";
          // ctx.lineWidth = 1;
          // // console.log('posX', this.position.x);
          // // console.log('posY', this.position.y);
          // // console.log('cur', this.currentMove);
          // // console.log('mapL', this.map.length);
          // ctx.beginPath();
          // ctx.rect(this.position.x+0 +j*sz, this.position.y+0+i*sz, sz, sz);
          // ctx.closePath();
          // ctx.fill();
          // ctx.stroke();

          if (this.map[i][j] == 2) {
            ctx.fillStyle = '#757575'; //rock


            //ctx.drawImage(this.res['rocks'], this.position.x+0 +j*sz, this.position.y+0+i*sz - sz *0.5, sz, sz*1.5);
          } else {
            ctx.fillStyle = '#0f0';

          }
          ctx.fillRect(i * 2, j * 2, 2, 2);

          //
          // ctx.fillStyle = '#0006';

          // ctx.fillText(i.toString() + ' / '+ j.toString(), this.position.x+0 +j*sz, this.position.y+0+i*sz);
          // if (this.opened[i][j]) {
          // ctx.drawImage(this.res['grass'], this.position.x+0 +j*sz, this.position.y+0+i*sz, sz, sz);
          // if (this.map[i][j] == 2){
          //   ctx.drawImage(this.res['rocks'], this.position.x+0 +j*sz, this.position.y+0+i*sz - sz *0.5, sz, sz*1.5);
          // }
          //   if (this.map[i][j] == 1) {    
          //     //ctx.drawImage(this.res['goldFull'], this.position.x+0 +j*sz, this.position.y+0+i*sz - (this.res['goldFull'].naturalHeight - 128), sz, sz* this.res['goldFull'].naturalHeight / 128);
          //   }


          // }
        }
        //ctx.drawImage(this.tile, this.position.x+0 +i*sz, this.position.y+0+j*sz, sz, sz);
      }
    }
  }

}