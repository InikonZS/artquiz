/*import {Application} from "./application/application";
import {Game} from "./ratalien/game";
import {MainCanvas} from './ratalien/engine';
import "./style.css";
import grass from './ratalien/sprites/grass.png';
import rocks from './ratalien/sprites/tree2.png';
import gold from './ratalien/sprites/gold_full.png';
import { loadImage } from "./ratalien/tracer";
import { ResourceLoader } from "./ratalien/loader";

const textureList = {
  grass: grass,
  rocks: rocks,
  gold: gold
};

//const textures: Record<string, HTMLImageElement> = {};

const resourceLoader = new ResourceLoader();
resourceLoader.loadTextures(textureList, (loaded, count)=>{
  console.log(loaded + ' / ' + count);
}).then(loaded=>{
  const app = new MainCanvas(document.body, loaded);
})
//new Application(document.body);*/

/*import {GameLauncher} from './ratalien2/gameLauncher';
new GameLauncher(document.body);*/
import grass from './ratalien/sprites/grass.png';
import rocks from './ratalien/sprites/tree2.png';
import gold from './ratalien/sprites/gold_full.png';
import map from './ratalien/map96.png';
import { ResourceLoader } from "./ratalien/loader";

import "./style.css";
import {Game} from "./ratalien/game";

let loader = new ResourceLoader();
loader.loadTextures({
  map: map,
  grass: grass,
  rocks: rocks
}).then(res=>{
  new Game(document.body, res);
})




