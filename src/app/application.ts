import Control from "../common/control";
import { SettingsModel, SettingsPage } from "./settingsPage";
import { StartPage } from "./startPage";
import { resources, resourceLoader } from '../ratalien/resources';

import { Game } from "../ratalien/game";
import { FinishPage } from './finishPage'

import "../style.css";
import style from "./application.css";

import { ResourceLoader } from "../ratalien/loader";

import {MapsModel} from './mapsLoader';

export class Application extends Control {
 
  settingsModel: SettingsModel;
  header: Control<HTMLElement>;
  main: Control<HTMLElement>;
  footer: Control<HTMLElement>;

  loader: ResourceLoader;
  game: Game;
  model: MapsModel;

  constructor(parentNode: HTMLElement) {
    super(parentNode, 'div', style["global_wrapper"]);

    // this.header = new Control(this.node, 'div', style["global_header"]);
    this.main = new Control(this.node, 'div', style["global_main"]);
    //  this.footer = new Control(this.node, 'div', style["global_footer"]);
    
    this.loader = resourceLoader;

    this.model = new MapsModel();
    this.model.build();
       
    this.settingsModel = new SettingsModel();
    this.settingsModel.loadFromStorage();  //оставлять сохранение? 
    
    this.mainCycle();
  }

 private finishCycle() {
    const finishPage = new FinishPage(this.main.node);
    //finishPage.animateIn();
    finishPage.onHome = () => {
      //finishPage.animateOut().then(() => {
      finishPage.destroy();
      this.mainCycle();
      //});
    }
    finishPage.onContinue = () => {
      // finishPage.animateOut().then(() => {
      finishPage.destroy();
      this.gameCycle();
      // });
    }
  }

  private gameCycle() {
    
    const settingsPage = new SettingsPage(this.main.node, this.settingsModel.getData(), this.model.data);
    settingsPage.onBack = () => {
      settingsPage.destroy();
      this.mainCycle();
    }
    settingsPage.onPlay = (settings) => {
      settingsPage.destroy();
      this.settingsModel.setData(settings);
      this.loader.load(resources).then(res => { //в ресурсах есть мар??
        const game = new Game(this.main.node, res.textures, settings/*{credits: 30000, map: res.textures.map }*/);
        game.onExit = () => {
          game.destroy();
          this.finishCycle();
        }
      })
    }
  }

  private mainCycle() {
    const startPage = new StartPage(this.main.node);
    startPage.animateIn();
    startPage.onGamePlay = (typeGame) => {
      startPage.animateOut().then(() => {
        startPage.destroy();
        this.gameCycle();
      });
    }
  }
}
