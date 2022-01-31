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
import { checkMap, findClosestBuild, getRandomNumber } from "./distance";
import { MapObject } from "./interactives";
import {TilesCollection} from "./TileElement";

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
    const tilesCollection: TilesCollection=new TilesCollection();
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
    let x = getRandomNumber(20) + player.minDistance,
      y = getRandomNumber(20) + player.minDistance;
    console.log('стартовая точка для бота [x:y] ', x,y);
    //const botPlayer = new BotPlayer((new Vector(x, y)),1); // тут была стартовая точка 20:20
    const map = new GameMap(96, 96, options.map, res,tilesCollection);
    const field = new GameField(main.node, res, [player/*, botPlayer*/], map,tilesCollection);
    player.onBuild = (build, pos) => {
      field.addObject(player, build, pos.x, pos.y)
    }

    player.onUnit = (unit) => {
      field.addUnit(player, unit.name)
    }

    // botPlayer.onBuild = (build, pos) => { // field.objects - все объекты, кот есть на поле игрока и бота
    //   // console.log('бот field.objects: ', field.objects)
    //   const builds = field.objects.list.filter(it => it instanceof MapObject) as MapObject[];
    //   // it.player === 'GamePlayer' && it.type === 'build') - Здания игрока
    //   // it.player === 'BotPlayer' && it.type === 'build') - Здания бота
    //
    //
    //   //Если приходит маска mask только из нулей - строить можно
    //   const mask = checkMap(map.map, build.mtx.map(it => it.map(jt => Number.parseInt(jt))), pos);
    //   const closestBuild = findClosestBuild(pos.clone(), builds);
    //
    //   let lengthNotAvalible = mask.flat().filter(itm => Number(itm) !== 0).length;
    //
    //   // if ((!builds.length || closestBuild.distance >= 6)){
    //   if ((!builds.length || closestBuild.distance >= 6) && lengthNotAvalible === 0) {
    //     // строим здание на позиции pos
    //     field.addObject(botPlayer, build, pos.x, pos.y);
    //     botPlayer.setBuilds(build);
    //   }
    // }

    // botPlayer.onUnit = (unit) => {
    //   field.addUnit(botPlayer, unit.name);
    // }

    // botPlayer.onAttack = ()=>{
      // let playerBuilds = field.objects.list.filter(it=>it.player==player);
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
