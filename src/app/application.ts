import Control from "../common/control";
import { SettingsModel, SettingsPage } from "./settingsPage";
import { StartPage } from "./startPage";
import grass from '../ratalien/sprites/grass.png';
import rocks from '../ratalien/sprites/tree2.png';
import gold from '../ratalien/sprites/gold_full.png';
import map from '../ratalien/map96g.png';
import plant from '../ratalien/sprites/plant.png';
import { Game } from "../ratalien/game";
import { FinishPage } from './finishPage'

import "../style.css";
import style from "./application.css";

import { ResourceLoader } from "../ratalien/loader";

export class Application extends Control {
 
  settingsModel: SettingsModel;
  header: Control<HTMLElement>;
  main: Control<HTMLElement>;
  footer: Control<HTMLElement>;

  loader: ResourceLoader;
  game: Game;

  constructor(parentNode: HTMLElement) {
    super(parentNode, 'div', style["global_wrapper"]);

    // this.header = new Control(this.node, 'div', style["global_header"]);
    this.main = new Control(this.node, 'div', style["global_main"]);
    //  this.footer = new Control(this.node, 'div', style["global_footer"]);
    
    this.loader = new ResourceLoader();
    
    this.settingsModel = new SettingsModel();
    this.settingsModel.loadFromStorage();
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
    const settingsPage = new SettingsPage(this.main.node, this.settingsModel.getData());
    settingsPage.onBack = () => {
      settingsPage.destroy();
      this.mainCycle();
    }
    settingsPage.onPlay = (settings) => {
      settingsPage.destroy();
      this.settingsModel.setData(settings);  //будет ли модель ??
      this.loader.loadTextures({
        map: map,
        grass: grass,
        rocks: rocks, 
        gold: gold,
        plant: plant
      }).then(res => {
        const game = new Game(this.main.node, res);
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
