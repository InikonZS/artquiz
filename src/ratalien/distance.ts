import {Vector} from '../common/vector';
import {MapObject, UnitObject} from "./interactives";

export function getTilingDistance(playerPosition:Vector, tilesPosition:Vector, tiles:Array<Array<number>>){
  let min = Number.MAX_SAFE_INTEGER;
  let absPosition = tilesPosition.clone().sub(playerPosition);
  tiles.forEach((it, y) => it.forEach((jt, x)=>{
    if (jt != 0){
      const distance = new Vector(x, y).add(absPosition).abs();
      if (distance<min){
        min = distance;
      }
    }
  }));
  return min;
}

export function findClosestUnit(playerPosition:Vector, units:Array<UnitObject>){
  let min = Number.MAX_SAFE_INTEGER;
  let minIndex = -1;
  units.forEach((it, i) => {
    const dist = Vector.fromIVector(it.position).sub(playerPosition).abs();
    if (dist<min){
      min = dist;
      minIndex = i;
    }
  });
  return {distance: min, unit:units[minIndex]}
}

export function findClosestBuild(playerPosition:Vector, builds:Array<MapObject>){
  let min = Number.MAX_SAFE_INTEGER;
  let minIndex = -1;
  builds.forEach((it, i) => {
    const dist = getTilingDistance(playerPosition, Vector.fromIVector(it.position), it.tiles);
    if (dist<min){
      min = dist;
      minIndex = i;
    }
  });
  return {distance: min, unit:builds[minIndex]}
}

export function makeCircleMap(radius:number){
  let d = radius*2 + 1;
  let map = [];
  for (let i = 0; i<d; i++){
    map.push(new Array(d).fill(0));
  }
	map[radius][radius]=1;
  for(let i=1; i<radius; i+=1){
    for(let j=0; j<Math.PI*2; j+=Math.PI/(6*i)){
      map[Math.round(radius+Math.sin(j)*(i))][Math.round(radius+Math.cos(j)*(i))] = 1;
    }
  }
 // console.log(map.map(it=>it.join('')).join('\n'))
  return map;
}