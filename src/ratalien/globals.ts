import {Vector, IVector} from "../common/vector";

export const consts = {
  colors: [
    '#ff0a',
    '#f0fa',
    '#0ffa'
  ],
  moves: [
    Vector.fromIVector({x:-1, y:-1}),
    Vector.fromIVector({x:0, y:-1}), 
      Vector.fromIVector({x:1, y:-1}),
  
        Vector.fromIVector({x:-1, y:0}), 
    null,
    Vector.fromIVector({x:1, y:0}),
  
      Vector.fromIVector({x:-1, y:1}), 
        Vector.fromIVector({x:0, y:1}),
          Vector.fromIVector({x:1, y:1}), 
  ]
}