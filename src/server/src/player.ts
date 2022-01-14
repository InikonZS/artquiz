import { IPlayer } from './iplayer';
import { connection } from 'websocket';

class Player {
  public id: string;
  public name: string = '';
  public connection: connection | null = null;

  constructor(id, name, connection) {
    this.id = id;
    this.name = name || '';
    this.connection = connection || null;
  }
  change({name}){
    this.name = name || '';
  }
  toJSON() {
    return {
      id: this.id,
      name: this.name,
    };    
  }
  
}

class PlayersList {
  public _list: Map<string, Player> = new Map();
  add(player: IPlayer, connection) {
    this._list.set(player.id, new Player(player.id, player.name, connection));
  }
  list() {
    return this._list;
  }
}

const playersList = new PlayersList();
export { playersList,PlayersList  };
