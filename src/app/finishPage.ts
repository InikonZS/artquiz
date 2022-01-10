import Control from "../common/control";
import { AnimatedControl } from "./animatedControl";
import style from './finishPage.css'

//export class FinishPage extends AnimatedControl{
export class FinishPage extends Control{
  onContinue: ()=>void;
  onHome: ()=>void;

  constructor(parentNode:HTMLElement){
    super(parentNode)//, 'div', {default: style["main_wrapper"], hidden: style["hide"]});

    const resultTable = new Control(this.node, 'div', '', 'result of game');
    resultTable.node.textContent = 'result result result';

    const continueButton = new Control(this.node, 'button', '', 'start game');
    continueButton.node.onclick = ()=>{
      this.onContinue();
    }

    const homeButton = new Control(this.node, 'button', '', 'home');
    homeButton.node.onclick = ()=>{
      this.onHome();
    }
  }
}