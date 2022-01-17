import Control from "../common/control";
import style from "./style.css";
import red from "./red.css";
import {Vector, IVector} from "../common/vector";
import {GameSide} from "./gameSidePanel";
import {BotPlayer} from "./botPlayer";
import { tech } from "./techTree";
import {GamePlayer, IBuildInfo} from "./gamePlayer";
import {consts} from "./globals";
import { GameField } from "./gameField";
import { GameModel } from './gameModel';
import { GameMap } from "./gameMap";
import { IGameOptions } from './IGameOptions';
import { globalGameInfo } from './globalGameInfo';
import { createIdGenerator } from './idGenerator';

export class Game extends Control{
  player:GamePlayer;
  currentPlayer:number = 0;
  onExit: () => void;
  constructor(parentNode: HTMLElement, res: Record<string, HTMLImageElement>, options: IGameOptions){
    super(parentNode, 'div', red['global_wrapper']);
    const idGenerator =  createIdGenerator('playerId')
    globalGameInfo.nextId = () => {
      return idGenerator() //TODO add options
    }
    this.node.onmouseleave = (e)=>{
     // console.log(e.offsetX, e.offsetY);
      if (e.offsetX>this.node.clientWidth){
        field.map.currentMove = consts.moves[5]
      }
      if (e.offsetX<0){
        field.map.currentMove = consts.moves[3]
      }
      if (e.offsetY>this.node.clientHeight){
        field.map.currentMove = consts.moves[7]
      }
      if (e.offsetY<0){
        field.map.currentMove = consts.moves[1]
      }
    }
    this.node.onmouseenter = ()=>{
      field.map.currentMove = null;
    }
    this.node.oncontextmenu = e => e.preventDefault();
    /*window.onmousemove = ()=>{
      console.log('mv');
    }*/
    const head = new Control(this.node, 'div', red["global_header"]);
    const main = new Control(this.node, 'div', red["global_main"]);
   //
    const buttonExit = new Control(main.node, 'button', red["exit_button"], 'Exit')
    buttonExit.node.onclick = () => {
      this.onExit();
    }
   //
    //const field = new GameField(main.node, res);
    const gameModel = new GameModel();

    const player = new GamePlayer(0);
    player.setMoney(options.credits);
    const botPlayer = new BotPlayer((new Vector(20, 20)),1); 
    const map = new GameMap(96, 96, options.map, res);
    const field = new GameField(main.node, res, [player, botPlayer], map);
    player.onBuild = (build, pos) => {
      field.addObject(player, build, pos.x, pos.y)
    }

    player.onUnit = (unit) => {
      field.addUnit(player, unit.name)
    }
    console.log('botPlayer', botPlayer)
    botPlayer.onBuild = (build, pos) => { // field.objects - все объекты, кот есть на поле игрока и бота
      field.addObject(botPlayer, build, pos.x, pos.y); //pos.x и y  - координаты где строить здание
      // Тут видны все актуальные постройки
      // И вероятно тут лучше будет строить
      // botPlayer.startPoint - начальная
      // field.objects

      // console.log('field.objects.list ', field.objects.list)
      let playerBuilds = field.objects.list.filter(it => it.type !== 'interactive');
      console.log('playerBuilds', playerBuilds)
    }

    botPlayer.onUnit = (unit) => {
      field.addUnit(botPlayer, unit.name);
    }

    // botPlayer.onAttack = ()=>{
    //   let playerBuilds = field.objects.list.filter(it=>it.player==0);
    //   if (playerBuilds.length == 0) return;
    // }
    

    //const side = new GameSide(main.node);
    //player.getAvailableBuilds();
    
    const side = new GameSide(main.node, player);
    side.onBuildSelect = (name, callback)=>{
      //field.setMode(1, name.desc[0], callback);
      field.setPlanned(name.desc[0], callback);
    }
    side.onUnitReady = (name:string)=>{
      field.addUnit(player, name);
    }
  }
}
