import { IVector, Vector } from "../common/vector";

function generate(){
  const map = [];
  for (let i=0; i<100; i++){
    const row = [];
    for (let j=0; j<100; j++){
      row.push(Number.MAX_SAFE_INTEGER);
    }
    map.push(row);
  }
  return map;
}

function generateEmptyMap(width:number, height:number){
  const map = [];
  for (let i=0; i<height; i++){
    const row = [];
    for (let j=0; j<width; j++){
      row.push(Number.MAX_SAFE_INTEGER);
    }
    map.push(row);
  }
  return map;
}

const steps = [
  {x: -1, y: 0}, {x: 1, y: 0}, {
   x: 0,
   y: 1
 }, {x: 0, y: -1}, {x: -1, y: -1}, {x: -1, y: 1}, {x: 1, y: 1}, {x: 1, y: -1},
]

function iteration(map:Array<Array<number>>, points:Array<{x:number, y:number}>, generation:number){
  const nextPoints: Array<{x:number, y:number}> = [];
  if (!points.length) { return; }
  points.forEach(point=>{
    steps.forEach(step=>{
      const px = point.x+step.x;
      const py = point.y+step.y;
      const row = map[py];
      if (row && row[px]!=null && row[px]>generation){
        row[px] = generation;
        nextPoints.push({x:px, y:py});
      }
    })
  });
  return nextPoints;
}

export function indexate(map:Array<Array<number>>, points:Array<{x:number, y:number}>, generation:number){
  const nextPoints = iteration(map, points, generation);
  if (!points.length) { return; }
  /*points.forEach(point=>{
    steps.forEach(step=>{
      const px = point.x+step.x;
      const py = point.y+step.y;
      const row = map[py];
      if (row && row[px]!=null && row[px]>generation){
        row[px] = generation;
        nextPoints.push({x:px, y:py});
      }
    })
  });*/
  indexate(map, nextPoints, generation+1);
}

export function indexateAsync(map:Array<Array<number>>, points:Array<{x:number, y:number}>, generation:number, onFinish:()=>void, startTime?:number){
  //let startTime = new Date();
  /*setTimeout(()=>{
    let iterationStart = new Date();
    //for (let i=0; i<10; i++){
      const nextPoints = iteration(map, points, generation);
      console.log('iteration '+ generation.toString(), (new Date()).valueOf() - iterationStart.valueOf());
      if (!nextPoints || !nextPoints.length){
        console.log('finished ', (new Date()).valueOf() - startTime.valueOf());
        onFinish();
        return;
      }
    //}
    indexateAsync(map, nextPoints, generation+1, onFinish, startTime);
  }, 0);*/
  indexate(map, points, generation);
  console.log('finished ', (new Date()).valueOf() - startTime.valueOf());
  onFinish();
}

export function findPath(map:Array<Array<number>>, indexPoint:Vector, destPoint:Vector){
  let path:Array<Vector> = [];
  let currentValue = map[destPoint.y][destPoint.x]
  if (currentValue == Number.MAX_SAFE_INTEGER) {
    return null;
  }
  let currentPoint:Vector = destPoint.clone();
  let crashDetector = 1000;
  while (currentValue != 0 && crashDetector>0){
    crashDetector--;
    let nextStep = steps.find(step=>{
      let point = currentPoint.clone().add(Vector.fromIVector(step));
      let result = map[point.y][point.x] == currentValue-1;
      if (result){
        currentPoint = point;
        currentValue = map[point.y][point.x];
        path.push(Vector.fromIVector(point));
      }
      return result;
    });
    
  }
if (crashDetector<0){
    throw new Error('Infinity cycle');
  }
  return path;
}

export function loadImage(src:string):Promise<HTMLImageElement>{
  return new Promise((resolve, reject)=>{
    let image = new Image();
    image.onload = ()=>{
      resolve(image)
    }
    image.onerror =(ev)=>{
      reject(ev);
    }
    image.src = src;
  });
}

export function getImageData(image:HTMLImageElement){
  let canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  let context = canvas.getContext('2d');
  context.drawImage(image,0,0);
  return context.getImageData(0,0, canvas.width, canvas.height);
}

export function isEqualColor(a:{r:number, g:number, b:number, a:number}, b:{r:number, g:number, b:number, a:number}){
  return a.r == b.r && a.g == b.g && a.b == b.b && a.a == b.a;
}

export function getMapFromImageData(data:ImageData){
  const map = generateEmptyMap(data.width, data.height);
  iterateImageData(data, (pos, color)=>{
    let mapColor = 0;
    if (isEqualColor(color, {r:0, g:0, b:0, a:255})){
      mapColor = 1;
    } else if (isEqualColor(color, {r:255, g:0, b:0, a:255})){
      mapColor = 2;
    } else if (isEqualColor(color, {r:0, g:255, b:0, a:255})){
      mapColor = 3;
    } else if (isEqualColor(color, {r:0, g:0, b:255, a:255})){
      mapColor = 4;
    }
    map[pos.x][pos.y] = mapColor;
  });
  return map;
}

export function iterateImageData(image:ImageData, iterator:(point:{x:number, y:number}, color: {r:number, g:number, b:number, a:number})=>void){
  const channels = 4;
  const color = {r:0, g:0, b:0, a:0};
  if (channels * image.width * image.height !== image.data.length){
    throw new Error('Invalid image data');
  }
  image.data.forEach((value, index)=>{
    const x = Math.floor(index / channels) % image.width;
    const y = Math.floor((index / channels) / image.width);
    const chan = index % channels; 
    switch (chan) {
      case 0: color.r = value; break;
      case 1: color.g = value; break;
      case 2: color.b = value; break;
      case 3: 
        color.a = value; 
        iterator({x, y}, {...color});
        break;
    }
  });
}