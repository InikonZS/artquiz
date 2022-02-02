import Control from "../common/control";
import { GamePreloader, Game } from "./game";

export class GameLauncher extends Control{
  constructor(parentNode:HTMLElement){
    super(parentNode);
    const game = new Game(this.node);
  }
}