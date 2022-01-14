import { createServer, RequestListener, Server } from 'http';
import { IServerResponseMessage } from './socket-server-interface';
import {
  connection,
  // IUtf8Message
} from 'websocket';
import { EventsType } from '../../web_app/src/socket-events-types';
import { playersList, PlayersList } from './player';
import { thingList , ThingsList} from './thing';

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

// const websocket = require('websocket');
import websocket  from 'websocket';

const sendResponse = (client: connection, type: string, obj: any) => {
  const responseMessage: IServerResponseMessage = {
    type: type,
    content: obj,
  };
  client.sendUTF(JSON.stringify(responseMessage));
};

class SocketService {
  private wss;
  constructor(srv: Server) {
    this.wss = new websocket.server({ httpServer: srv });
    this.wss.on('request', this.onConnect);
  }

  onConnect(request) {
    const connection = request.accept(undefined, request.origin);

    connection.on('message', (_message) => {
      const sendAll = (type, content) => {
        let arr = Array.from(playersList.list().keys());
        for (let i in arr) {
          let p = playersList.list().get(arr[i]);
          try {
            sendResponse(p.connection, type, content);
          } catch (e) {
            console.log(e);
          }
        }
      };
      const sendAllList = () => {
        sendList(EventsType.USER_LIST, playersList)
        sendList(EventsType.THING_LIST ,thingList)
      }
      const sendList = (type: EventsType ,thisList:PlayersList | ThingsList) => {
        let arr = Array.from(thisList.list().keys());
        let list = [];
        for (let i in arr) {
          let p = playersList.list().get(arr[i]);
          list.push(p);
        }
        sendAll(type, { list: list });
      };

      let data = JSON.parse(_message.utf8Data);
      console.log(data.type, 'xxxx');
      if (data.type == EventsType.USER_CONNECT) {
        playersList.add(data.content.player, connection);
        for(let k in data.content.player.thingsList){
          const thing = data.content.player.thingsList[k]
          thingList.add(thing)
        }
        sendAllList();
      } else if (data.type == EventsType.USER_CHANGE) {
        playersList.list().get(data.content.id).change(data.content);
        sendAllList();
      } else if (data.type == EventsType.THING_CHANGE) {
        sendAll(EventsType.THING_CHANGE, data.content);
      }
    });
  }
}

const wsc = new SocketService(httpWSServer);
export { wsc };
