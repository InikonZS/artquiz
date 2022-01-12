import { Vector } from "../common/vector";

const options = [
  {
    name: 'explosion',
    keyCode: 'boom',  
    src: './ratalien/sprites/explosion_1.png',
    width: 851,
    height: 158,
    numberOfFrames: 6,
  },
  /*{
    name: 'left',
    keyCode: 'KeyA',
    src: './assets/worm-walks-left-100.png',
    width: 1442,
    height: 100,
    numberOfFrames: 15,
  },
  {
    name: 'jump',
    keyCode: 'KeyW',
    src: './assets/worm-jump-100.png',
    width: 107,
    height: 100,
    numberOfFrames: 2,
  },*/
]

export default class Animation {
  spritesheet: HTMLImageElement;
  width: number;
  height: number;
  numberOfFrames: number;
  frameIndex: number;
  isStarted: boolean;
  scale: number;
  onFinish: () => void;
  constructor(image: HTMLImageElement, numberOfFrames:number, scale:number = 1) {
   /* let spritesheet = new Image();
    spritesheet.src = imageURL;*/
    this.spritesheet = image;
    this.width = image.naturalWidth;
    this.height = image.naturalHeight;
    this.numberOfFrames = numberOfFrames || 1;
    this.frameIndex = 0;
    this.isStarted = false;
    this.scale = scale
  }
  start(/*keyCode*/) {
    this.isStarted = true;
    this.frameIndex = 0;
    // if (keyCode) {
    //   this.setOptions(keyCode);
    // }
  }

  stop() {
    this.isStarted = false;
  }

  update(deltaTime:number) {  
    this.frameIndex += deltaTime/100;  
    if (this.frameIndex >= this.numberOfFrames) {
      this.onFinish?.();
      this.frameIndex = 0;
    }
  }

  

  drawFrame(context:CanvasRenderingContext2D, frame:number, x:number, y:number) {  //frame - номер кадра
    context.drawImage(this.spritesheet,
                      frame * this.width / this.numberOfFrames,
                      0,
                      this.width / this.numberOfFrames,
                      this.height,
                      x - (this.width / this.numberOfFrames / this.scale) / 2,
                      y - (this.height / this.scale) / 2,
                      (this.width / this.numberOfFrames) / this.scale,
                      this.height / this.scale)
  }

  drawCurrentFrame(context:CanvasRenderingContext2D, x:number, y:number){
    this.drawFrame(context, Math.trunc(this.frameIndex), x, y)
  }

  render(context:CanvasRenderingContext2D, deltaTime:number, position:Vector){
    if (this.isStarted) {
      this.update(deltaTime);
    }
    this.drawCurrentFrame(context, position.x, position.y);
  }

  /*setOptions(keyCode) {
    const currentOptions = options.filter(it => it.keyCode === keyCode)[0];
    this.spritesheet.src = currentOptions.src;
    this.width = currentOptions.width;
    this.height = currentOptions.height;
    this.numberOfFrames = currentOptions.numberOfFrames;
  }*/
} 