import Control from "../common/control";
import style from "./style.css";
import red from "./red.css";
import { GamePlayer, IBuildInfo } from "./gamePlayer";

export class GameSide extends Control{
  onBuildSelect: (name:IBuildInfo, clearFunc:()=>void)=>void;
  onUnitReady: (name:string)=>void;
  updateBuildHandler: () => void;
  model: GamePlayer;
  buildings: Control<HTMLElement>;
  dataBuild: Control<HTMLElement>[]=[];
  money: Control<HTMLElement>;
  isReadingBuild: boolean = false;
  isReadingUnit:boolean = false;
  units: Control<HTMLElement>;

  constructor(parentNode: HTMLElement, player: GamePlayer){
    super(parentNode, 'div', red['game_side']);
    this.model = player;
    this.updateBuildHandler = () => {
      this.createBuild();
      this.createUnits();
    }
    player.onUpdateBuild.add(this.updateBuildHandler);

    const radar = new Control(this.node, 'div', red["game_radar"])
    this.money = new Control(radar.node, 'div');
    const builds = new Control(this.node, 'div', red["game_builds"]);
    const buildTools = new Control(builds.node, 'div', red["builds_tool"]);
    const buildItems = new Control(builds.node, 'div', red["builds_items"]);
    const buildingsW = new Control(buildItems.node, 'div', red["builds_column"]);
    this.buildings = new Control(buildingsW.node, 'div', red["column_items"]);
    this.createBuild();
    this.updateMoney(player.money);
    
    const unitsW = new Control(buildItems.node, 'div', red["builds_column"]);
    this.units = new Control(unitsW.node, 'div', red["column_items"]);
    this.createUnits();
  } 
  
  updateMoney(value: number){
    this.money.node.textContent = Math.round(value).toString();
  }

  createUnits() {
    this.units.node.textContent = '';
    const uns = this.model.getAvailableUnits();
    uns.forEach(it=>{
      const unit = new Control(this.units.node, 'div', red["builds_item"], it.name);
      let isBuilding = false;
      //let isBuilded = false;
      let progress = 0;
      unit.node.onclick = ()=>{
        if (isBuilding == false && this.isReadingUnit == false&&this.model.money>0) {
          let money = this.model.money;
          const cost = it.cost/it.time;
          isBuilding = true;
          this.isReadingUnit = true;
          let intId = setInterval(()=>{
            progress += 1;
            this.updateMoney(money - cost);
            money -= cost;
            unit.node.textContent = `${it.name} - ${(progress * 10).toFixed(0)} / ${it.time * 10}`;
            if (money <= 0) {
              this.updateMoney(0);
              clearInterval(intId);
            }
            if (progress >= it.time){
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
  }

  createBuild() {
    const blds = this.model.getAvailableBuilds();
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
}