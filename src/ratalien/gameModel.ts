import { GamePlayer } from './gamePlayer';
export class GameModel{
  players: GamePlayer[];
  myPlayerIndex: number;
 // myPlayer: GamePlayer;
  gameField: GameFieldModel;

  constructor() {
    //this.gameField = new GameFieldModel();
    //this.myPlayer = new GamePlayer();
  }
}

class GameFieldModel{
  constructor() {
    
  }
}