import Control from "../common/control";
import style from "./settingsPage.css"

export interface ISettings{
  money: number,
  speed: number,
  idMap: number,
  players: string[] // TODO что в интерфейсе настроек??
  
}

const defaultSettings:ISettings = {
  money: 5000,
  speed: 7,
  idMap: 1,
  players: ['player_1', 'player_2', 'player_3'] 
}
export class SettingsModel{
  private settings: ISettings;
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
      const data:ISettings = JSON.parse(storageData);
      this.settings = data;
    }
  }

  getData(){
    return JSON.parse(JSON.stringify(this.settings));
  }

  setData(data:ISettings){
    this.settings = data;
    this.saveToStorage();
  }

  saveToStorage(){
    localStorage.setItem('settings', JSON.stringify(this.settings));
  }
}

export class SettingsPage extends Control{
  onBack: ()=>void;
  onPlay: (settings:ISettings)=>void;

  constructor(parentNode:HTMLElement, initialSettings:ISettings){
    super(parentNode, 'div', style["main_wrapper"]);//{default: style["main_wrapper"], hidden: style["hide"]});    
    
    const settings: ISettings = initialSettings;
    const settingsWrapper = new Control(this.node, 'div', style["settings_wrapper"]);

    const basicSettingsWrapper = new Control(settingsWrapper.node, 'div', style["basic_settings_wrapper"]);
    const moneyWrapper = new Control(basicSettingsWrapper.node, 'div', style["item_wrapper"]);
    const moneyLabel = new Control<HTMLLabelElement>(moneyWrapper.node, 'label', '', 'Кредит')
    const moneyInput = new Control<HTMLInputElement>(moneyWrapper.node, 'input', style['input_settings'], '5000');
    moneyInput.node.type = 'text';
    moneyInput.node.oninput = () => {
    }

    const speedWrapper = new Control(basicSettingsWrapper.node, 'div', style["item_wrapper"]);
    const speedLabel = new Control<HTMLLabelElement>(speedWrapper.node, 'label', '', 'Скорость')
    const speedInput = new Control<HTMLInputElement>(speedWrapper.node, 'input', style['input_settings'], '7');
    speedInput.node.type = 'text';

    const playersWrapper = new Control(settingsWrapper.node, 'div', style["players_wrapper"]);
    const players = new Control<HTMLLabelElement>(playersWrapper.node, 'textarea', style['players_area'], 'Игроки')

    const infoWrapper = new Control(settingsWrapper.node, 'div', style["info_wrapper"]);
    const info = new Control<HTMLLabelElement>(infoWrapper.node, 'textarea', style['info_area'], 'Информация')


    const mapWrapper = new Control(settingsWrapper.node, 'div', style["map_wrapper"]);
    const mapLabel = new Control<HTMLLabelElement>(mapWrapper.node, 'label', '', 'Карта')
    const mapImage = new Control<HTMLInputElement>(mapWrapper.node, 'div', style['image_map']);
    /*mapImage.node.src = './ratalien/map.png'
    mapImage.node.alt = 'there is a map';*/


    const buttonsWrapper = new Control(settingsWrapper.node, 'div', style["buttons_wrapper"]);
    const backButton = new Control(buttonsWrapper.node, 'button', '', 'back');
    backButton.node.onclick = ()=>{
      this.onBack();
    }

    const saveButton = new Control(buttonsWrapper.node, 'button', '', 'play');
    saveButton.node.onclick = ()=>{
      this.onPlay(settings);
    }
  }
}