// import websocket from 'websocket'


export interface IServerResponseMessage {
    type: string;
    content: string;
}

export interface IServerRequestMessage {
    type: string;
    content: string;
}

export interface IUser {
    id: string;
    userName: string;
}



// export interface IPlayer {
//     user: string;
//     cardsCount: number;
// }

