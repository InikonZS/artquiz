import { connection } from 'websocket';

interface IConnect {
  id: string
  name: string
}

class Connection {
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
  toJSON():IConnect {
    return {
      id: this.id,
      name: this.name,
    };    
  }
  
}

class ConnectionList {
  public _list: Map<string, Connection> = new Map();
  add(connect: Connection | IConnect, connection) {
    this._list.set(connect.id, new Connection(connect.id, connect.name, connection));
  }
  list() {
    return this._list;
  }
}

const connectionList = new ConnectionList();
export { connectionList,ConnectionList  };
