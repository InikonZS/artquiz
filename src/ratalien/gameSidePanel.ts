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
  isReading:boolean = false;

  constructor(parentNode: HTMLElement, player: GamePlayer){
    super(parentNode, 'div', red['game_side']);
    this.model = player;
    this.updateBuildHandler = () => {
      this.createBuild();
      this.updateMoney();
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
    this.updateMoney();
    
    const unitsW = new Control(buildItems.node, 'div', red["builds_column"]);
    const units = new Control(unitsW.node, 'div', red["column_items"]);
    const uns = ['msu', 'csu', 'tcu', 'asd'];
    uns.forEach(it=>{
      const unit = new Control(units.node, 'div', red["builds_item"], it);
      let isBuilding = false;
      //let isBuilded = false;
      let progress = 0;
      unit.node.onclick = ()=>{
        if (isBuilding ==false){
          isBuilding = true;
          let intId = setInterval(()=>{
            progress+=0.1;
            unit.node.textContent = `${it} - ${(progress*100).toFixed(0)} / 100`;
            if (progress >= 1){
              progress = 0;
              unit.node.textContent = it;//`${it} - ready`;
              //isBuilded = true;
              isBuilding = false;
              this.onUnitReady(it);
              clearInterval(intId);
            }
          }, 300);
        }  
      }
    });
  } 
  
  updateMoney(){
    this.money.node.textContent = this.model.money.toString();
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
        if (isBuilded == false && isBuilding ==false&&this.isReading == false){
          isBuilding = true;
          this.isReading = true;
          let intId = setInterval(()=>{
            progress+=1;
            build.node.textContent = `${name} - ${(progress*10).toFixed(0)} / ${it.time}`;
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
            this.isReading = false;
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