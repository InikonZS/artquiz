import Control from "../common/control";
import style from "./settingsPage.css"
import { DataModel, IMapsData } from "./mapsLoader";

export interface ISettings {
  money: number,
  speed: number,
  idMap: number,
  players: string[],
   // TODO что в интерфейсе настроек??

}

const defaultSettings: ISettings = {
  money: 10000,
  speed: 7,
  idMap: 1,
  players: ['player_1']
}

const mapSizes = ['64x64', '64x96', '96x96', '128x96', '128x128']

export class SettingsModel {
  private settings: ISettings;
  constructor() {
  }

  loadFromStorage() {
    const storageData = localStorage.getItem('settings');
    const checkStorageData = (data: string | null) => {
      return !!data;
    }
    if (!checkStorageData(storageData)) {
      this.settings = defaultSettings;
    } else {
      const data: ISettings = JSON.parse(storageData);
      this.settings = data;
    }
  }

  getData() {
    return JSON.parse(JSON.stringify(this.settings));
  }

  setData(data: ISettings) {
    this.settings = data;
    this.saveToStorage();
  }

  saveToStorage() {
    localStorage.setItem('settings', JSON.stringify(this.settings));
  }
}

export class SettingsPage extends Control {
  onBack: () => void;
  onPlay: (settings: ISettings) => void;
  maps: IMapsData[];
  filteredMaps: IMapsData[];
  map: IMapsData;

  constructor(parentNode: HTMLElement, initialSettings: ISettings, maps: IMapsData[]) {

    super(parentNode, 'div', style["main_wrapper"]);// TODO сделать анимацию страницы //{default: style["main_wrapper"], hidden: style["hide"]});    
    this.maps = maps;
    this.filterMaps('64x64');  //TODO запихнуть в дефолтные настройки
    this.map = this.filteredMaps[0];
    const settings: ISettings = initialSettings;
    const settingsWrapper = new Control(this.node, 'div', style["settings_wrapper"]);

    const basicSettingsWrapper = new Control(settingsWrapper.node, 'div', style["basic_settings_wrapper"]);
    const moneyWrapper = new Control(basicSettingsWrapper.node, 'div', style["item_wrapper"]);
    const moneyLabel = new Control<HTMLLabelElement>(moneyWrapper.node, 'label', '', 'Кредит')
    const moneyInput = new Control<HTMLInputElement>(moneyWrapper.node, 'input', style['input_settings']);
    moneyInput.node.type = 'text';
    moneyInput.node.value = '10000'
    moneyInput.node.readOnly = true;

    const speedWrapper = new Control(basicSettingsWrapper.node, 'div', style["item_wrapper"]);
    const speedLabel = new Control<HTMLLabelElement>(speedWrapper.node, 'label', '', 'Скорость')
    const speedInput = new Control<HTMLInputElement>(speedWrapper.node, 'select', style['input_settings'], '7');
    for (let i = 1; i <= 7; i++) {
      const speedValue = new Control<HTMLOptionElement>(speedInput.node, 'option', style[''], `${i}`);
      speedValue.node.value = i.toString();
      speedValue.node.onclick = () => {
        // TODO выбор скорости
      }
    }

    const selectedMapWrapper = new Control(basicSettingsWrapper.node, 'div', style["item_wrapper"]);
    const selectedMapLabel = new Control<HTMLLabelElement>(selectedMapWrapper.node, 'label', '', 'Выбранная карта:')
    const selectedMapInput = new Control<HTMLInputElement>(selectedMapWrapper.node, 'input', style['input_settings']);
    selectedMapInput.node.type = 'text';
    selectedMapInput.node.value = this.map.name + '  '+ this.map.size;
    selectedMapInput.node.readOnly = true;

    const playersWrapper = new Control(settingsWrapper.node, 'div', style["players_wrapper"]);
    const players = new Control<HTMLLabelElement>(playersWrapper.node, 'textarea', style['players_area'], 'Игроки')

    const infoWrapper = new Control(settingsWrapper.node, 'div', style["info_wrapper"]);
    const info = new Control<HTMLLabelElement>(infoWrapper.node, 'textarea', style['info_area'], 'Информация')


    const mapWrapper = new Control(settingsWrapper.node, 'div', style["map_wrapper"]);
    const selectWrapper = new Control(mapWrapper.node, 'div', style["map_select_wrapper"]);
    //const mapLabel = new Control<HTMLLabelElement>(mapWrapper.node, 'label', style["map_label"], 'Карта')
    const selectLabel = new Control<HTMLLabelElement>(selectWrapper.node, 'label', style["map_label"], 'Размер карты:')
    const mapSelect = new Control<HTMLSelectElement>(selectWrapper.node, 'select', style['map_select']);

    mapSelect.node.onchange = () => {
      this.filterMaps(mapSelect.node.value);
      this.changeMap(imageMap, selectedMapInput);
      // this.setImageMap(imageMap);
      // selectedMapInput.node.value = this.map.name + '  '+ this.map.size;
      
    }
    const mapValues = mapSizes.map((it, i) => {
      const option = new Control<HTMLOptionElement>(mapSelect.node, 'option', '', it.toString());
      option.node.value = it.toString();
    })

    const mapSlider = new Control(mapWrapper.node, 'div', style["map_slider"]);
    const prevButton = new Control(mapSlider.node, 'button', style["slider_button"], ' << ');
    prevButton.node.onclick = () => {
      let index = this.filteredMaps.indexOf(this.map);
      if (index == 0) {
        index = this.filteredMaps.length-1;
      } else index--;      
      this.changeMap(imageMap, selectedMapInput, index)    
    }
    const imageWrapper = new Control<HTMLDivElement>(mapSlider.node, 'div', style['image_map']);
    const imageMap = new Image(200, 200);  
    imageWrapper.node.append(imageMap);

    this.setImageMap(imageMap);

    const nextButton = new Control(mapSlider.node, 'button', style["slider_button"], ' >> ');
    nextButton.node.onclick = () => {
      let index = this.filteredMaps.indexOf(this.map);
      if(index == this.filteredMaps.length-1) index = 0; else index++;      
      this.changeMap(imageMap, selectedMapInput, index)
    }
    const buttonsWrapper = new Control(settingsWrapper.node, 'div', style["buttons_wrapper"]);
    const backButton = new Control(buttonsWrapper.node, 'button', '', 'back');
    backButton.node.onclick = () => {
      this.onBack();
    }

    const saveButton = new Control(buttonsWrapper.node, 'button', '', 'play');
    saveButton.node.onclick = () => {
      this.onPlay(settings);
    }
  }

  filterMaps(value:string ) {
    this.filteredMaps = this.maps.filter(item => item.size == value);
  }

  setImageMap(imageMap: HTMLImageElement, num:number = 0){
    imageMap.src = this.filteredMaps[num].src; // TODO прописать правильный путь к изображениям
    imageMap.alt = `Карта ${this.filteredMaps[num].name} размером ${this.filteredMaps[num].size}`;
    this.map = this.filteredMaps[num];
    console.log(this.map);
  }

  changeMap(imageMap: HTMLImageElement, selectedMapInput: Control<HTMLInputElement>, num:number = 0){
    this.setImageMap(imageMap, num);
    selectedMapInput.node.value = this.map.name + '  '+ this.map.size;
  }
}