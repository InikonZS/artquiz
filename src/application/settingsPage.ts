import Control from "../common/control";

export interface IQuizSettings{
  time:number;
  timeEnable:boolean;
}

const defaultSettings:IQuizSettings = {
  time:10,
  timeEnable:false
}
export class SettingsModel{
  private settings: IQuizSettings;

  constructor(){

  }

  loadFromStorage(){
    const storageData = localStorage.getItem('settings');
    const checkStorageData = (data:string|null)=>{
      return !!data;
    }
    if (!checkStorageData(storageData)){
      this.settings = defaultSettings;
    } else {
      const data:IQuizSettings = JSON.parse(storageData);
      this.settings = data;
    }
  }

  getData(){
    return JSON.parse(JSON.stringify(this.settings));
  }

  setData(data:IQuizSettings){
    this.settings = data;
    this.saveToStorage();
  }

  saveToStorage(){
    localStorage.setItem('settings', JSON.stringify(this.settings));
  }
}

export class SettingsPage extends Control{
  onBack: ()=>void;
  onSave: (settings:IQuizSettings)=>void;

  constructor(parentNode:HTMLElement, initialSettings:IQuizSettings){
    super(parentNode);    
    
    const settings: IQuizSettings = initialSettings;
    /* {
      time:10,
      timeEnable:false
    }*/

    const timeInput = new Control<HTMLInputElement>(this.node, 'input', '');
    timeInput.node.type = 'range';
    timeInput.node.min = 10..toString();
    timeInput.node.max = 30..toString();
    timeInput.node.step = 1..toString();
    timeInput.node.value = settings.time.toString();
    timeInput.node.oninput = ()=>{
      settings.time = timeInput.node.valueAsNumber;
    }

    const timeCheck = new Control<HTMLInputElement>(this.node, 'input');
    timeCheck.node.type = 'checkbox';
    timeCheck.node.checked = settings.timeEnable;
    timeCheck.node.oninput = ()=>{
      settings.timeEnable = timeCheck.node.checked;
    }

    const backButton = new Control(this.node, 'button', '', 'back');
    backButton.node.onclick = ()=>{
      this.onBack();
    }


    const saveButton = new Control(this.node, 'button', '', 'save');
    saveButton.node.onclick = ()=>{
      this.onSave(settings);
    }
  }
}