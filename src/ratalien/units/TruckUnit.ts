import { InteractiveObject } from './interactiveObject';
import { MapObject } from './mapObject';
import { AbstractUnit } from './abstractUnit';
import {WeaponTrack} from './weaponTrack';
import { Gold } from '../gold';
import { OreFactory } from './oreFactory';
import { findClosestBuild, findClosestGold } from '../distance';
import { Vector, IVector } from "../../common/vector";


export class TruckUnit extends AbstractUnit{
  weapon: WeaponTrack;
  closestGold: InteractiveObject;
  
 // getResource: () => InteractiveObject[];
  constructor(){
    super();
    this.weapon = new WeaponTrack();
    
    this.weapon.onBulletTarget = (point)=>{
      this.onDamageTile?.(point);
      const newClosestGold =  findClosestGold(this.position.clone(),  this.getList().list.filter(item=>item instanceof Gold));
      if (newClosestGold !== this.closestGold) {
        this.attackTarget = null;
      }
    }
  }

  step(delta: number) {
    super.step(delta);
    this.logic();
  }

  getAction(hovered: InteractiveObject, mapTile?: number) {
    // console.log('трак get Action')
    // console.log('hovered: ', hovered, 'mapTile: ', mapTile)

    let action = 'move';
    if (hovered instanceof Gold) { // действие - собирать золото
      action = 'gold';
      this.action = 'gold';
    } else if (hovered instanceof OreFactory && hovered?.player == this.player){
      action = 'cash_in'
    }
    return action;
  }
  
  getDamage(target: InteractiveObject) {
    return 0;    
  }

  logic() {
    // console.log('')
    // console.log('this.attackTarget: ', this.attackTarget)
    // console.log('this.positionPx: ', this.positionPx)
    console.log('countSpendTime: ', this.countSpendTime)    

    if (this.gold >= 3000) {
      const oreFactory = this.getList().list.filter(item => item.name == 'oreFactory' && this.player === item.player) as MapObject[];
      const closestBuild = findClosestBuild(this.position.clone(), oreFactory);
      if (closestBuild.tile) {
        this.setTarget(closestBuild.tile);
      }
    } 
    else if (this.action === 'gold') { // если цель - золото
      if (!this.attackTarget){ //attackTarget - цель атаки трака - золото или null, когда золото закончилось
        this.closestGold = findClosestGold(this.position.clone(), this.getList().list.filter(item=>item instanceof Gold));
        this.setTarget(this.closestGold.position); // отправляю трак к золоту
      } else {
        this.setTarget(this.positionPx); // трак стоит на месте
      }
    }

    // Задача. Юнит. Если стоит 20сек, то ищет себе сам цель. -----{

    if (this.attackTarget === undefined) {
      this.countSpendTime++;
    }

    if (this.countSpendTime >= 20*40) { //Ждет 20 сек и если его никуда не послали, едет за ближайшим золотом
      this.action = 'gold';
      this.countSpendTime = 0;
      this.attackTarget = undefined;
    }
    // Задача. Юнит. Если стоит 20сек, то ищет себе сам цель. -----}
  }
  
  
  render(ctx: CanvasRenderingContext2D, camera: Vector, delta: number, size: number, selected: boolean) {
    super.render(ctx, camera, delta, size, selected)
    // const sz = 10;
    // ctx.fillStyle = this.isHovered?"#9999":consts.colors[this.player.colorIndex];
    // ctx.strokeStyle = "#000";
    // ctx.lineWidth = 1;
    // ctx.beginPath();
    // ctx.ellipse(camera.x + this.positionPx.x, camera.y+ this.positionPx.y, sz, sz, 0, 0, Math.PI*2);
    // ctx.closePath();
    // ctx.fill();
    // ctx.stroke();
    // ctx.fillStyle = "#000";
    // ctx.fillText(this.name, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-10);
    // // Прогресс-баз состояния здоровья Юнита
    // ctx.strokeStyle = '#666'
    // ctx.strokeRect(camera.x + this.positionPx.x,camera.y + this.positionPx.y - 20, 100, 10);
    // ctx.fillStyle = '#ccc'
    // ctx.fillRect(camera.x + this.positionPx.x, camera.y + this.positionPx.y - 20, 100, 10);
    // ctx.fillStyle = 'blue';
    // ctx.fillRect(camera.x + this.positionPx.x, camera.y + this.positionPx.y - 20, this.health, 10);
    
    // if (selected){
    //   ctx.fillText(`selected`, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-30);  
    // }

    // if (this.gold){
    //   ctx.fillText(`gold: ${this.gold} / ${this.maxGold}`, camera.x + this.positionPx.x, camera.y+ this.positionPx.y-40);  
    // }

    // this.weapon.render(ctx, camera);
    // this.step(delta);
  }

}

