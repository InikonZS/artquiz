import {Application} from "./application/application";
import {Game} from "./ratalien/game";
import {MainCanvas} from './ratalien/engine';
import "./style.css";
import grass from './ratalien/sprites/grass.png';
import rocks from './ratalien/sprites/gold_full.png';
import { loadImage } from "./ratalien/tracer";

const textures: Record<string, HTMLImageElement> = {};
loadImage(grass).then((res)=>{
  textures['grass'] = res;
  loadImage(rocks).then((res)=>{
    textures['rocks'] = res;
    const app = new MainCanvas(document.body, textures);//new Application(document.body);
  });
});


