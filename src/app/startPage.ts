import Control from "../common/control";
import style from "./startPage.css";
import {AnimatedControl} from "./animatedControl"

export class StartPage extends AnimatedControl{
  onSettings: ()=>void;
  onGamePlay: (typeGame:string)=>void;
  
  constructor(parentNode:HTMLElement){
    super(parentNode, 'div', {default: style["main_wrapper"], hidden: style["hide"]});
    this.quickOut();
   
    const selectWrapper = new Control(this.node, 'div', style["select_wrapper"]);
    const onlineGameButton = new Control(selectWrapper.node, 'button', [style["select_item"], style["multi_player"]].join(' '), 'Multiplayer');
    onlineGameButton.node.onclick = () => this.onGamePlay('multiplayer');
    
    const aloneGameButton = new Control(selectWrapper.node, 'button', [style["select_item"], style["single_player"]].join(' '), 'Singleplayer');
    aloneGameButton.node.onclick = () => this.onGamePlay('singleplayer');

  }
}