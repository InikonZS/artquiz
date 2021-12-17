import Control from "../common/control";

import style from "./startPage.css";
import {AnimatedControl} from "./animatedControl"

export class StartPage extends AnimatedControl{
  onSettings: ()=>void;
  onGameSelect: (gameName:string)=>void;
  
  constructor(parentNode:HTMLElement){
    super(parentNode, 'div', {default: style["main_wrapper"], hidden: style["hide"]});
    this.quickOut();
    
    const selectWrapper = new Control(this.node, 'div', style["select_wrapper"]);
    const picturesButton = new Control(selectWrapper.node, 'button', style["select_item"], 'pictures');
    picturesButton.node.onclick = () => this.onGameSelect('pictures');

    const artistsButton = new Control(selectWrapper.node, 'button', style["select_item"], 'artists');
    artistsButton.node.onclick = () => this.onGameSelect('artists');

    const settingsWrapper = new Control(this.node, 'div', style["main_bottom"]);
    const settingsButton = new Control(settingsWrapper.node, 'button', style["button"], 'settings');
    settingsButton.node.onclick = () => this.onSettings();
  }
}