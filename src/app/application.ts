import Control from "../common/control";
import {SettingsModel, SettingsPage} from "./settingsPage";
import {StartPage} from "./startPage";
import {resources, resourceLoader} from '../ratalien/resources';

import {Game} from "../ratalien/game";
import {FinishPage} from './finishPage'

import "../style.css";
import style from "./application.css";

import {ResourceLoader} from "../ratalien/loader";
import {SocketClient, wsc} from "../ratalien/sockets/socket-client";
import {EventsType} from "../common/socket-events-types";
import Signal from "../common/signal";


export class Application extends Control {
  settingsModel: SettingsModel;
  header: Control<HTMLElement>;
  main: Control<HTMLElement>;
  footer: Control<HTMLElement>;

  loader: ResourceLoader;
  game: Game;
  private settingsPage: SettingsPage;
  private drawBinded: (s: string[]) => void;
  private typeGame: string;
  private playersOnline: string[];
  protected onSignal:Signal<string>=new Signal<string>()
  private userName: string;
  constructor(parentNode: HTMLElement) {
    super(parentNode, 'div', style["global_wrapper"]);
this.typeGame=null

    this.playersOnline=[]
    // this.header = new Control(this.node, 'div', style["global_header"]);
    this.main = new Control(this.node, 'div', style["global_main"]);
    //  this.footer = new Control(this.node, 'div', style["global_footer"]);
    this.loader = resourceLoader;
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
    this.settingsPage = new SettingsPage(this.main.node,this.settingsModel.getData(),
      this.typeGame==='multiplayer' && this.playersOnline,
      this.typeGame==='multiplayer' && this.userName);
    this.settingsPage.onBack = () => {
      this.settingsPage.destroy();
      this.mainCycle();
    }
    this.onSignal.add((params)=>this.settingsPage.addPlayerName(params)
    )
    this.settingsPage.onPlay = (settings) => {
      this.settingsPage.destroy();
      this.settingsModel.setData(settings);  //будет ли модель ??
      this.loader.load(resources).then(res => {
        const game = new Game(this.main.node, res.textures, {credits: 30000, map: res.textures.map});
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

      console.log("***",typeGame)
      this.typeGame='multiplayer'
      const randomNameI = Math.floor(Math.random() * 100)
      this.userName='TESTName' + randomNameI
      wsc.sendRequest(EventsType.ADD_PLAYER, '', '', {name: this.userName})
      wsc.on(EventsType.ADD_PLAYER, (t) => {
        const response = JSON.parse(t)
        if(response instanceof Array && response.length>0){
          this.playersOnline=response
        }
        this.onSignal.emit(response)
      })
      startPage.animateOut().then(() => {
        startPage.destroy();
        this.gameCycle();
      });
    }
  }
}
