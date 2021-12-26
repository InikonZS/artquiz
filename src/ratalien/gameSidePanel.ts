import Control from "../common/control";
import style from "./style.css";
import red from "./red.css";

export class GameSide extends Control{
  onBuildSelect: (name:string, clearFunc:()=>void)=>void;
  onUnitReady: (name:string)=>void;

  constructor(parentNode: HTMLElement){
    super(parentNode, 'div', red['game_side']);
    const radar = new Control(this.node, 'div', red["game_radar"]);
    const builds = new Control(this.node, 'div', red["game_builds"]);
    const buildTools = new Control(builds.node, 'div', red["builds_tool"]);
    const buildItems = new Control(builds.node, 'div', red["builds_items"]);
    const buildingsW = new Control(buildItems.node, 'div', red["builds_column"]);
    const buildings = new Control(buildingsW.node, 'div', red["column_items"]);
    const blds = ['ms', 'cs', 'tc'];
    blds.forEach((it, i)=>{
      const build = new Control(buildings.node, 'div', red["builds_item"], it);
      let isBuilding = false;
      let isBuilded = false;
      let progress = 0;
      build.node.onclick = ()=>{
        if (isBuilded == false && isBuilding ==false){
          isBuilding = true;
          let intId = setInterval(()=>{
            progress+=0.1;
            build.node.textContent = `${it} - ${(progress*100).toFixed(0)} / 100`;
            if (progress >= 1){
              progress = 1;
              build.node.textContent = `${it} - ready`;
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
            build.node.textContent = it;
          });
        }
      }
    });
    
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
}