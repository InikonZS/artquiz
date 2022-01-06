import Control from "../common/control";
import { ResourceLoader } from "./resourceLoader";
import { IGameResources, IGameResult, IGameSettings } from "./gameCycleInterfaces";
import { GameField } from "./gameField";

export class Game extends Control{
  constructor(parentNode:HTMLElement){
    super(parentNode);
    const preloader = new GamePreloader(this.node);
    preloader.onStartLoading = ()=>{    
      this.node.requestFullscreen();
    }
    preloader.onLoaded = (resources) =>{
      preloader.destroy();
      const settings = new GameSettings(this.node);
      settings.onStart = (settingsData)=>{
        settings.destroy();
        const gameField = new GameField(this.node, resources, settingsData);
        gameField.onFinish = ()=>{
          /* cycles */
        }
      }
    }
  }
}

export class GamePreloader extends Control{
  public onStartLoading: ()=>void;
  public onLoaded: (resources:IGameResources)=>void;
  constructor(parentNode:HTMLElement){
    super(parentNode);
    const playButton = new Control(this.node, 'button', '', 'Play');
    playButton.node.onclick = ()=>{
      this.onStartLoading?.();
      playButton.destroy();
      const loadingIndicator = new Control(this.node, 'div', '', 'Loading...');
      const resourceLoader = new ResourceLoader();
      resourceLoader.loadTextures({}, (loaded, count)=>{
        loadingIndicator.node.textContent = `Loading ${loaded} / ${count}`;
      }).then((textures)=>{
        this.onLoaded?.(textures);
      })
    }
  }  
}

export class GameSettings extends Control{
  public onStart: (settings:IGameSettings)=>void;
  constructor(parentNode:HTMLElement){
    super(parentNode);
    const startButton = new Control(this.node, 'button', '', 'Start');
    startButton.node.onclick = ()=>{
      this.onStart?.({/*settings*/});
    }
  }
}
