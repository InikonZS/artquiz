interface IServerResponseMessage {
    type: string;
    content: string;
}
interface IServerRequestMessage {    
    type: string;
    user: string;
    object: string;
    content:any;
}
class MsgHash {
    public hash: Map<string,Map<string,IServerRequestMessage>>
    constructor(){
        this.hash = new Map()
    } 
    add(msg:IServerRequestMessage){
        if(!this.hash.has(msg.type)){
            this.hash.set(msg.type, new Map());
        }
        this.hash.get(msg.type).set(msg.object,msg)                 
    }
}

class SocketClient {
    private wsc: WebSocket = null;
    private msgHash: MsgHash = new  MsgHash();
    private listeners: Map<string,Set<(data:any)=>void>> = new Map();

    constructor(){
        const _websocket = new window.WebSocket('ws://127.0.0.1:3000/');        
        _websocket.onopen = () => {
            this.wsc = _websocket;
            console.log('connect')
            this.sendHash();
        };
        _websocket.onmessage = (ev) => {
            const response: IServerResponseMessage = JSON.parse(ev.data);
            console.log('_websocket.onmessage',response.type)
            for(let type of this.listeners.keys()){
                if(type==response.type){
                    for(let callback of this.listeners.get(type)){
                        callback.call(this,response.content);
                    }
                    break;
                }
            }
        }
    }
    destroy() {
        if (this.wsc == null) return;
        this.wsc.onclose = null;
        this.wsc.close();
    }

    sendMessage(user:string ,content: any) {
        this.sendRequest('message', user, 'message', content);
    }
    sendRequest(type: string, user: string, object:string, content: any) {
        const request: IServerRequestMessage = {
            type: type,
            user: user,
            object: object,
            content: content,
        };
        this.msgHash.add(request)
        if(this.wsc){
            this.sendHash();
        }        
    }
    sendHash(){
        for(let t of this.msgHash.hash.keys()){
            const typeMsg = this.msgHash.hash.get(t)
            for(let o of typeMsg.keys()){
               setTimeout(()=>this.wsc.send(JSON.stringify(typeMsg.get(o))),1)
            }
        }
    }
    on(type:string, callback){
        let cbSet:Set<(data:any)=>void> 
        if(this.listeners.has(type))
            cbSet = this.listeners.get(type)
        else 
            cbSet = new Set()
        cbSet.add(callback)
        this.listeners.set(type,cbSet);
    }
    remove(type:string,callback){
        this.listeners.get(type).delete(callback)
    }
}

const wsc = new SocketClient();
export {wsc,IServerRequestMessage,IServerResponseMessage} 