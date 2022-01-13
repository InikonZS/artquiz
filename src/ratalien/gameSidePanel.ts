import Control from "../common/control";
import style from "./style.css";
import red from "./red.css";
import { GamePlayer, IUnitInfo } from "./gamePlayer";
import { ITechBuild } from "./interactives";

export class GameSide extends Control{
  onBuildSelect: (name:ITechBuild, clearFunc:()=>void)=>void;
  onUnitReady: (name:string)=>void;
  updateBuildHandler: () => void;
  model: GamePlayer;
  buildings: Control<HTMLElement>;
  buildingsFirstColumnFooter: Control<HTMLElement>;
  buttonFirstColumnUp: Control<HTMLButtonElement>;
  buttonFirstColumnDown: Control<HTMLButtonElement>;
  buildingsSecondColumnFooter: Control<HTMLElement>;
  buttonSecondColumnUp: Control<HTMLButtonElement>;
  buttonSecondColumnDown: Control<HTMLButtonElement>;
  dataBuild: Control<HTMLElement>[]=[];
  money: Control<HTMLElement>;
  isReadingBuild: boolean = false;
  isReadingUnit:boolean = false;
  units: Control<HTMLElement>;
  blds: Array<ITechBuild>;
  uns: Array<IUnitInfo>;

  constructor(parentNode: HTMLElement, player: GamePlayer){
    super(parentNode, 'div', red['game_side']);
    this.model = player;
    this.blds = this.model.getAvailableBuilds();
    this.uns = this.model.getAvailableUnits();

    this.updateBuildHandler = () => {
      this.createBuild();
      this.createUnits();
      this.updateMoney(player.money);
      this.changeFirstColumnButtonsState();
      this.changeSecondColumnButtonsState();
    }
    // console.log('red', red)
    player.onUpdateBuild.add(this.updateBuildHandler);

    const radar = new Control(this.node, 'div', red["game_radar"])
    this.money = new Control(radar.node, 'div', red["aside-top-panel"]);
    const builds = new Control(this.node, 'div', red["game_builds"]);
    const buildTools = new Control(builds.node, 'div', red["builds_tool"]);
    const buildItems = new Control(builds.node, 'div', red["builds_items"]);
    const buildingsW = new Control(buildItems.node, 'div', red["builds_column"]);
    this.buildings = new Control(buildingsW.node, 'div', red["column_items"]);
    this.buildingsFirstColumnFooter = new Control(buildingsW.node, 'div', red["column_footer"]);
    this.buttonFirstColumnUp = new Control(this.buildingsFirstColumnFooter.node, 'div', red["button"] + ' ' + red["button_up"]);
    this.buttonFirstColumnDown = new Control(this.buildingsFirstColumnFooter.node, 'div', red["button"] + ' ' + red["button_down"]);

    this.changeFirstColumnButtonsState();
    this.createBuild();
    this.updateMoney(player.money);

    // Обработка нажатий на кнопoк Вверх/Вниз в столбце построек
    this.buttonFirstColumnUp.node.onclick = () => {
      if (this.blds.length > 6) {
        let firstElement: ITechBuild = this.blds.shift()
        this.blds.push(firstElement)
        this.createBuild(this.blds);
      }
    }
    this.buttonFirstColumnDown.node.onclick = () => {
      if (this.blds.length > 6) {
        let lastElement: ITechBuild = this.blds.pop()
        this.blds.unshift(lastElement)
        this.createBuild(this.blds);
      }
    }    
    
    const unitsW = new Control(buildItems.node, 'div', red["builds_column"]);
    this.units = new Control(unitsW.node, 'div', red["column_items"]);
    this.buildingsSecondColumnFooter = new Control(unitsW.node, 'div', red["column_footer"]);
    this.buttonSecondColumnUp = new Control(this.buildingsSecondColumnFooter.node, 'div', red["button"] + ' ' + red["button_up"]);
    this.buttonSecondColumnDown = new Control(this.buildingsSecondColumnFooter.node, 'div', red["button"] + ' ' + red["button_down"]);

    this.changeSecondColumnButtonsState();
    this.createUnits();

    // Обработка нажатий на кнопoк Вверх/Вниз в столбце юнитов
    this.buttonSecondColumnUp.node.onclick = () => {
      if (this.uns.length > 6) {
        let firstElement: IUnitInfo = this.uns.shift()
        this.uns.push(firstElement)
        this.createUnits(this.uns);
      }
    }
    this.buttonSecondColumnDown.node.onclick = () => {
      if (this.uns.length > 6) {
        let firstElement: IUnitInfo = this.uns.pop()
        this.uns.unshift(firstElement)
        this.createUnits(this.uns);
      }
    }
  } 
  
  updateMoney(value: number){
    this.money.node.textContent = Math.round(value).toString();
  }

  createUnits(uns: Array<IUnitInfo> = this.model.getAvailableUnits()) {
    this.units.node.textContent = '';
    this.uns = uns;
    // const uns = this.model.getAvailableUnits();
    if (uns.length > 0) {
      uns.forEach(it => {
        const unit = new Control(this.units.node, 'div', red["builds_item"], it.name);
        let isBuilding = false;
        //let isBuilded = false;
        let progress = 0;
        unit.node.onclick = () => {
          if (isBuilding == false && this.isReadingUnit == false && this.model.money > 0) {
            let money = this.model.money;
            const cost = it.cost / it.time;
            isBuilding = true;
            this.isReadingUnit = true;
            let intId = setInterval(() => {
              progress += 1;
              this.updateMoney(money - cost);
              money -= cost;
              unit.node.textContent = `${it.name} - ${(progress * 10).toFixed(0)} / ${it.time * 10}`;
              if (money <= 0) {
                this.updateMoney(0);
                clearInterval(intId);
              }
              if (progress >= it.time) {
                progress = 0;
                unit.node.textContent = it.name;//`${it} - ready`;
                //isBuilded = true;
                isBuilding = false;
                this.isReadingUnit = false;
                this.onUnitReady(it.name);
                this.model.setUnit(it);
                clearInterval(intId);
              }
            }, 300);
          }
        }
      });
    };
  }

  createBuild(blds: Array<ITechBuild> = this.model.getAvailableBuilds()) {
    this.blds = blds;
    // const blds = this.model.getAvailableBuilds();
    this.buildings.node.innerHTML = '';
    
    blds.forEach((it, i) => {
      const name = it.name;
      const build = new Control(this.buildings.node, 'div', red["builds_item"], name);
      let isBuilding = false;
      let isBuilded = false;
      let progress = 0;
      build.node.onclick = ()=>{
        if (isBuilded == false && isBuilding == false && this.isReadingBuild == false&&this.model.money>0) {
          let money = this.model.money;
          const cost = it.cost/(it.time/10);
          isBuilding = true;
          this.isReadingBuild = true;
          let intId = setInterval(()=>{
            progress += 1;
            this.updateMoney(money - cost);
            money -= cost;
            build.node.textContent = `${name} - ${(progress * 10).toFixed(0)} / ${it.time}`;
            if (money <= 0) {
              this.updateMoney(0);
              clearInterval(intId);
            }
            if (progress >= it.time/10){
              progress = 1;
              build.node.textContent = `${name} - ready`;
              build.node.classList.add(red["builds_item__ready"])
              isBuilded = true;
              isBuilding = false;
              clearInterval(intId);
            }
          }, 300);
        }
        if (isBuilded){
          this.onBuildSelect(it, ()=>{
            isBuilded = false; 
            progress = 0;
            build.node.textContent = name;
            this.isReadingBuild = false;
            this.model.setBuilds(it);
          });
        }
      }
      this.dataBuild.push(build);
    });
  }

  destroy() {
    this.model.onUpdateBuild.remove(this.updateBuildHandler);
    super.destroy();
  }

  changeFirstColumnButtonsState() {
    // Менять состояние кнопок вверх/вниз в зависимости от количества Построек
    if (this.blds.length <= 6) {
      this.buttonFirstColumnUp.node.classList.add(red["button__inactive"])
      this.buttonFirstColumnDown.node.classList.add(red["button__inactive"])
    } else {
      this.buttonFirstColumnUp.node.classList.remove(red["button__inactive"])
      this.buttonFirstColumnDown.node.classList.remove(red["button__inactive"])
    }    
  }

  changeSecondColumnButtonsState() {
    // Менять состояние кнопок вверх/вниз в зависимости от количества Юнитов
    if (this.uns.length <= 6) {
      this.buttonSecondColumnUp.node.classList.add(red["button__inactive"])
      this.buttonSecondColumnDown.node.classList.add(red["button__inactive"])
    } else {
      this.buttonSecondColumnUp.node.classList.remove(red["button__inactive"])
      this.buttonSecondColumnDown.node.classList.remove(red["button__inactive"])
    }
  }
}