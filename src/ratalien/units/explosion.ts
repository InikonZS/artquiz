import {InteractiveObject} from './interactiveObject';
import {resourceLoader} from '../resources';
import Animation from '../animation';
import { Vector } from '../../common/vector';


export class Explosion extends InteractiveObject{
  animation: Animation;
  _position: Vector;
  get position(){
    return this._position;
  }
  set position(val:Vector){
    this._position = val;
  }
  
  constructor(position:Vector){
    super()
    this.position = position.clone();
    this.animation = new Animation(resourceLoader.textures['explosion'], 6, 1);
    this.animation.start();
    this.animation.onFinish = () => {
      this.onDestroyed();
    }
   

  } 
  render(ctx:CanvasRenderingContext2D, camera:Vector, delta:number){
    this.animation.render(ctx, delta, this.position.clone().add(camera));
  } 
}