import { IThing } from './iplayer';

class Thing {
  public state: IThing;
  constructor(props:IThing) {
    this.state = props;
  }
  toJSON(){
    return this.state;
  }
}

class ThingsList {
  public _list: Map<string, Thing> = new Map();
  add(thing: IThing) {
    console.log('------------------>',thing.user)
    this._list.set(thing.id, new Thing(thing));
  }
  list() {
    return this._list;
  }  
}

const thingList = new ThingsList();
export { thingList, ThingsList };
