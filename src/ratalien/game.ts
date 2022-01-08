import Control from "../common/control";
import style from "./style.css";
import red from "./red.css";
import {Vector, IVector} from "../common/vector";
import {GameSide} from "./gameSidePanel";
import {BotPlayer} from "./botPlayer";
import { tech } from "./techTree";
import {GamePlayer, IBuildInfo} from "./gamePlayer";
import {consts} from "./globals";
import {GameField} from "./gameField";

export class Game extends Control{
  player:GamePlayer;
  currentPlayer:number = 0;
  constructor(parentNode: HTMLElement, res: Record<string, HTMLImageElement>){
    super(parentNode, 'div', red['global_wrapper']);
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
    const player = new GamePlayer();
    const botPlayer = new BotPlayer(new Vector(20, 20)); 

    const field = new GameField(main.node, res, [player, botPlayer]);
    botPlayer.onBuild = (pos)=>{
      field.addObject(1, tech.builds.find(it=>it.name == 'barracs'), pos.x, pos.y);
    }

    botPlayer.onUnit = ()=>{
      field.addUnit(1, 'csu');
    }

    //botPlayer.

    botPlayer.onAttack = ()=>{
      //let botUnits = field.units.filter(it=>it.player==1);
      let playerBuilds = field.objects.list.filter(it=>it.player==0);
      if (playerBuilds.length == 0) return;
      /*botUnits.forEach(it=>{
        if (it.attackTarget.health<=0){
          it.attackTarget = null;
        }
      })*/
      //if (botUnits.length ==0) return;
      //botUnits[Math.floor(Math.random()* botUnits.length)].attackTarget = playerBuilds[Math.floor(Math.random()* playerBuilds.length)];
    }
    

    //const side = new GameSide(main.node);
    //player.getAvailableBuilds();
    
    const side = new GameSide(main.node, player);
    side.onBuildSelect = (name, callback)=>{
      //field.setMode(1, name.desc[0], callback);
      field.setPlanned(name.desc[0], callback);
    }
    side.onUnitReady = (name:string)=>{
      field.addUnit(0, name);
    }
  }
}
