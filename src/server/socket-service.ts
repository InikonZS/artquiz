import {createServer, RequestListener, Server} from 'http';
import {IServerResponseMessage} from './socket-server-interface';
import {
  connection, IUtf8Message,
  // IUtf8Message
} from 'websocket';
import {EventsType} from '../common/socket-events-types';
import {playersList, PlayersList} from './player';
import {thingList, ThingsList} from './thing';

// import { connect } from 'http2';
// import { any } from 'nconf';
// import { string } from 'prop-types';

const requestHandler: RequestListener = (request, response) => {
  response.end('Hello  Node.js Server!');
};
const httpWSServer = createServer(requestHandler);
const wssPort = '3000';

httpWSServer.listen(wssPort, () => {
  console.log(`WS is listening on ${wssPort}`);
});

//const websocket = require('websocket');
import * as websocket from 'websocket';

const sendResponse = (client: connection, type: string, obj: any) => {
  const responseMessage: IServerResponseMessage = {
    type: type,
    content: obj,
  };
  client.sendUTF(JSON.stringify(responseMessage));
};

class SocketService {
  private wss:websocket.server;
  private connections: connection[];
  public usersName: string[];

  constructor(srv: Server) {
    this.wss = new websocket.server({httpServer: srv});
    this.wss.on('request', (request:websocket.request)=>this.onConnect(request));
    this.connections = []
    this.usersName=[]
//Undefined
  }

  onConnect(request:websocket.request) {
    const connection = request.accept(undefined, request.origin);
   //console.log("Wow connect")
    connection.on('message', (_message) => {
      const sendAll = (type, content) => {
        const other=this.connections.filter(c=>c!=connection)
        const cur=this.connections.filter(c=>c==connection)
        other.forEach(c=>{
          console.log("TTTTT",type,other)
          if(type==EventsType.ADD_PLAYER){
            sendResponse(c,type,JSON.stringify(content.newPlayer))
          }
          sendResponse(c,type,JSON.stringify(content))
        })
        cur.forEach(c=>{
          console.log("UUU",type.cur)
          if(type==EventsType.ADD_PLAYER){
            sendResponse(c,type,JSON.stringify(content.usersOnline))
          }
          sendResponse(c,type,JSON.stringify(content))
        })

        // let arr = Array.from(playersList.list().keys());
        // for (let i in arr) {
        //   let p = playersList.list().get(arr[i]);
        //   try {
        //     sendResponse(p.connection, type, content);
        //   } catch (e) {
        //     //console.log(e);
        //   }
        // }
      };
      const sendAllList = () => {
        sendList(EventsType.USER_LIST, playersList)
        sendList(EventsType.THING_LIST, thingList)
       // this.connections.forEach(connection => {
       //    sendResponse(connection,'activePlayers',JSON.stringify({users:this.usersName}))
       //    //connection.sendUTF(JSON.stringify('Request' + this.usersName))
       //  })
      }
      const sendList = (type: EventsType, thisList: PlayersList | ThingsList) => {
        let arr = Array.from(thisList.list().keys());
        let list = [];
        for (let i in arr) {
          let p = playersList.list().get(arr[i]);
          list.push(p);
        }
        sendAll(type, {list: list});
      };

      if (_message.type === 'utf8') {
        const message = _message as IUtf8Message;
        let data = JSON.parse(message.utf8Data);
        if (data.type === 'message') {
          sendAllList();
        }

        if (data.type == EventsType.USER_CONNECT) {
          playersList.add(data.content.player, connection);
          for (let k in data.content.player.thingsList) {
            const thing = data.content.player.thingsList[k]
            thingList.add(thing)
          }
          sendAllList();
        }
        if(data.type== EventsType.ADD_PLAYER){
          this.connections.push(connection)
          this.usersName.push(data.content.name)
          const usersOnline=this.usersName.filter(us=>us!==data.content.name)
          sendAll(EventsType.ADD_PLAYER,{usersOnline,newPlayer:data.content.name})
        }
        if(data.type== EventsType.SEND_MESSAGE){
          sendAll(EventsType.SEND_MESSAGE,{name:data.content.user,text:data.content.text})
        }
        else if (data.type == EventsType.USER_CHANGE) {
          playersList.list().get(data.content.id).change(data.content);
          sendAllList();
        }
        else if (data.type == EventsType.THING_CHANGE) {
          sendAll(EventsType.THING_CHANGE, data.content);
        }

      }else{
        throw new Error('Not utf8');
      }
     });

  }
}

const wsc = new SocketService(httpWSServer);
export {wsc};
