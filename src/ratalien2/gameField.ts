import Control from "../common/control";
import { IGameResources, IGameResult, IGameSettings } from "./gameCycleInterfaces";
//import {GameSidePanel} from "./gameSidePanel";

export class GameField extends Control{
  public onFinish: (result:IGameResult)=>void;

  constructor(parentNode:HTMLElement, resources: IGameResources, settings: IGameSettings){
    super(parentNode);
    const finishButton = new Control(this.node, 'button', '', 'finish');
    finishButton.node.onclick = ()=>{
      this.onFinish?.({/*results*/});
    }

    //new GamePlayer();

    //new GameSidePanel(this.node);
  }
}