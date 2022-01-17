import { v4 as uuid } from 'uuid';

const SESSION_USER = "ret_alert_session_user";
class Session {
  public id: string;
  constructor() {
    const obj = this.loadFromStore();
    this.id = !obj || !obj.id ? uuid() : obj.id;
  }
  loadFromStore() {
    const str = sessionStorage.getItem(SESSION_USER);
    if (str) {
      return JSON.parse(str);
    }
    return {};
  }
  save2Store() {
    const obj = {
      id: this.id,
    };
    sessionStorage.setItem(SESSION_USER, JSON.stringify(obj));
  }
}

export const session = new Session()

