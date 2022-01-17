import { createServer, RequestListener, Server } from "http";
import { IServerResponseMessage } from "./socket-server-interface";
import { connection, IUtf8Message } from "websocket";
import { EventsType } from "../common/socket-events-types";
import { connectionList } from "./connectlist";

const requestHandler: RequestListener = (request, response) => {
  response.end("Hello  Node.js Server!");
};
const httpWSServer = createServer(requestHandler);
const wssPort = "3000";

httpWSServer.listen(wssPort, () => {
  console.log(`WSocket is listening on ${wssPort}`);
});

import * as websocket from "websocket";

const sendResponse = (client: connection, type: string, obj: any) => {
  const responseMessage: IServerResponseMessage = {
    type: type,
    content: obj,
  };
  client.sendUTF(JSON.stringify(responseMessage));
};

class SocketService {
  private wss: websocket.server;

  constructor(srv: Server) {
    this.wss = new websocket.server({ httpServer: srv });
    this.wss.on("request", (request: websocket.request) =>
      this.onConnect(request)
    );    
  }

  onConnect(request: websocket.request) {
    const connection = request.accept(undefined, request.origin);
    
    connection.on("message", (_message) => {
      console.log("MESS");
      if (_message.type === "utf8") {
        const message = _message as IUtf8Message;
        let data = JSON.parse(message.utf8Data);
        if (data.type == EventsType.CONNECT) {
          console.log("EventsType.CONNECT", data.sessionID);
          connectionList.add(data.sessionID, connection);
        } else {
          console.log(`Unknow EventsType [${data.type}]` );
        }
      } else {
        throw new Error("Not utf8");
      }
    });
  }
}

const wsc = new SocketService(httpWSServer);
export { wsc };
