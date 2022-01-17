import { EventsType } from "../../common/socket-events-types";
import {session} from './session';
interface IServerResponseMessage {
  type: EventsType;
  content: string;
}
interface IServerRequestMessage {
  sessionID: string;
  type: string;
  user: string;
  object: string;
  content: any;
}

class MsgHash {
  public hash: Map<string, Map<string, IServerRequestMessage>>;

  constructor() {
    this.hash = new Map();
  }

  add(msg: IServerRequestMessage) {
    if (!this.hash.has(msg.type)) {
      this.hash.set(msg.type, new Map());
    }
    this.hash.get(msg.type).set(msg.object, msg);
  }
}

export class SocketClient {
  private wsc: WebSocket = null;
  private msgHash: MsgHash = new MsgHash();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private _websocket: WebSocket = new WebSocket("ws://127.0.0.1:3000/");

  constructor() {
    this.connect();
  }

  connect() {
    // const fn_connect = this.connect;
    this._websocket = new WebSocket("ws://127.0.0.1:3000/");
    this._websocket.onopen = () => {
      this.sendRequest(EventsType.CONNECT,'id user','id object',{});
      this.event(EventsType.CONNECT, "");
      this.wsc = this._websocket;
      this.sendHash();
    };
    this._websocket.onmessage = (ev) => {
      const response: IServerResponseMessage = JSON.parse(ev.data);
      this.event(response.type, response.content);
    };
    this._websocket.onclose = (e) => {
      this.wsc = null;
      this.event(EventsType.DISCONNECT, "");
      console.log("Socket is closed. Reconnect will be attempted in 1 second.");
      setTimeout(() => {
        this.connect();
      }, 1000);
    };
    this._websocket.onerror = (err) => {
      this.event(EventsType.ERROR, "");
      console.error("Socket encountered error: ", err, "Closing socket");
    };
  }

  destroy() {
    if (this.wsc == null) return;
    this.wsc.onclose = null;
    this.wsc.close();
  }

  sendMessage(user: string, content: any) {
    //  console.log('send')
    this.sendRequest("addPlayer", user, "message", content);
  }

  sendRequest(type: string, user: string, object: string, content: any) {
    console.log("sendQeu");
    const request: IServerRequestMessage = {
      sessionID: session.id,
      type: type,
      user: user,
      object: object,
      content: content,
    };
    // this._websocket.send(JSON.stringify(request));
    this.msgHash.add(request);
    if (this.wsc) {
      this.sendHash();
    }
  }
  sendHash() {
    for (let t of this.msgHash.hash.keys()) {
      const typeMsg = this.msgHash.hash.get(t);
      for (let o of typeMsg.keys()) {
        console.log('/? ? ?',typeMsg.get(o))
        this.wsc.send(JSON.stringify(typeMsg.get(o)));
      }
    }
  }

  on(type: string, callback: (params: any) => void) {
    let cbSet: Set<(data: any) => void>;
    if (this.listeners.has(type)) cbSet = this.listeners.get(type);
    else cbSet = new Set();
    cbSet.add(callback);
    this.listeners.set(type, cbSet);
  }
  remove(type: string, callback: (params: any) => void) {
    this.listeners.get(type).delete(callback);
  }
  event(ev_type: EventsType, content: string) {
    for (let type of this.listeners.keys()) {
      if (type == ev_type) {
        for (let callback of this.listeners.get(type)) {
          callback.call(this, content);
        }
        break;
      }
    }
  }
}

const wsc = new SocketClient();
export { wsc, IServerRequestMessage, IServerResponseMessage };
