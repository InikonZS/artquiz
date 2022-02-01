import {findClosestBuild, findClosestUnit, getTilingDistance} from '../distance';
import {Vector, IVector} from "../../common/vector";
import {InteractiveObject} from "./interactiveObject";
import {consts} from "../globals";
import AbstractWeapon from "./abstractWeapon";
import {MapObject} from './mapObject';
import {GamePlayer} from '../gamePlayer';
import {Tile, TilesCollection} from "../TileElement";

export class AbstractUnit extends InteractiveObject {
  positionPx: Vector;
  target: Vector = null;
  speed: number = 1.5;
  name: string;
  attackTarget: Vector;
  player: GamePlayer;
  time: number = 0;
  path: Vector[];
  health: number = 100;
  tileChecker: (pos: Vector) => boolean;
  type: string = 'unit';
  onDamageTile: (point: Vector) => void;
  // getResource: () => InteractiveObject[];
  // getObjects: () => InteractiveObject[];
  setTarget: (point: Vector) => void;
  //getObjectInTile: (point: Vector) => InteractiveObject;
  protected gold: number = 0;
  maxGold: number = 3000;
  weapon: AbstractWeapon;
  targetEnemy: { distance: number; unit: AbstractUnit; } | { distance: number; unit: MapObject; tile: Vector; };
  goal: String;
  tileCoordinates: { x: any; y: any };
  private tileCollection: TilesCollection;
  private subTile: { x: any; y: any };

  get position() {
    return new Vector(Math.floor(this.positionPx.x / 55), Math.floor(this.positionPx.y / 55));
  }

  constructor(tilesCollection: TilesCollection, goal: String = 'wait') {
    super();
    this.goal = goal;
    // this.weapon = new Weapon();
    // this.weapon.onBulletTarget = (point)=>{
    //   this.onDamageTile?.(point);
    // }
    this.tileCollection = tilesCollection
  }

  inShape(tile: Vector, cursor: Vector) {
    let pos = cursor.clone().sub(new Vector(this.positionPx.x, this.positionPx.y));
    if (pos.abs() < 15) {
      return true;
    }
    return false;
  }

  render(ctx: CanvasRenderingContext2D, camera: Vector, delta: number, size: number, selected: boolean) {
    const sz = 10;
    ctx.fillStyle = this.isHovered ? "#9999" : consts.colors[this.player.colorIndex];
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(camera.x + this.positionPx.x, camera.y + this.positionPx.y, sz, sz, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.fillText(this.name, camera.x + this.positionPx.x, camera.y + this.positionPx.y - 10);
    // ctx.fillText(`health: ${this.health}`, camera.x + this.positionPx.x, camera.y + this.positionPx.y - 20);
    // Прогресс-баз состояния здоровья Юнита
    ctx.strokeStyle = '#666'
    ctx.strokeRect(camera.x + this.positionPx.x, camera.y + this.positionPx.y - 20, 100, 10);
    ctx.fillStyle = '#ccc'
    ctx.fillRect(camera.x + this.positionPx.x, camera.y + this.positionPx.y - 20, 100, 10);
    ctx.fillStyle = 'blue';
    ctx.fillRect(camera.x + this.positionPx.x, camera.y + this.positionPx.y - 20, this.health, 10);

    if (selected) {
      ctx.fillText(`selected`, camera.x + this.positionPx.x, camera.y + this.positionPx.y - 30);
    }

    if (this.gold) {
      ctx.fillText(`gold: ${this.gold} / ${this.maxGold}`, camera.x + this.positionPx.x, camera.y + this.positionPx.y - 40);
    }

    this.weapon.render(ctx, camera);
    this.step(delta);
  }

  addGold(amount: number) {
    if (this.gold == this.maxGold) {
      return false;
    }
    this.gold += amount;
    if (this.gold > this.maxGold) {
      this.gold = this.maxGold;
    }
    return true;
  }

  getGold() {
    return this.gold;
  }

  clearGold() {
    if (this.gold == 0) {
      return false;
    }
    this.gold = 0;
    return true;
  }

  step(delta: number) {
    const speed = this.speed;
    const sz = 55;
    if (this.target && this.tileChecker
        && !this.tileChecker(new Vector(Math.floor(this.target.x / sz), Math.floor(this.target.y / sz)))) {
     // return;
    }
    if (this.target) {
      const tile = this.tileCollection.getTileData(`${this.tileCoordinates.x}-${this.tileCoordinates.y}`)
      const direction = this.defineDirection({x: this.target.x / 55, y: this.target.y / 55}, this.tileCoordinates)
      const completeMoveInsideTile = this.moveInsideTile(tile, direction)
      if (typeof completeMoveInsideTile === 'number') {
        const subTileInNextTile = this.tileCollection.unitChangeTile(
          this, this.tileCoordinates, {x: this.target.x / 55, y: this.target.y / 55},
          direction)
        if (subTileInNextTile) {
          this.subTile = subTileInNextTile
        }
      }
      if (this.subTile) {
        this.positionPx = this.positionPx.clone().add(new Vector(this.target.x + this.subTile.x, this.target.y + this.subTile.y).clone()
          .sub(this.positionPx).normalize().scale(speed));
        if (Math.abs(Math.floor(this.positionPx.x) - Math.floor(this.target.x + this.subTile.x)) <= 2
            && Math.abs(Math.floor(this.positionPx.y) - Math.floor(this.target.y + this.subTile.y)) <= 2) {
          this.subTile = null
          this.tileCoordinates = {x: this.target.x / 55, y: this.target.y / 55}
          if (this.path && this.path.length) {
            this.target = this.path.pop().clone().scale(sz);
          }
          else {
            this.target = null
            return
          }
        }
      }
    }


    if (this.attackTarget) {
      if (this.shot()) {
        this.target = null;
        this.path = null;
      }
      ;
    }
    this.weapon.step(delta);
    this.weapon.position = this.position.clone();
  }

  setPath(path: Array<Vector>, tileChecker: (pos: Vector) => boolean, attackPoint: Vector = null) {
    console.log('set Path',path,tileChecker)
    this.attackTarget = attackPoint
    const sz = 55;
    this.path = [...path].reverse();
    this.target = this.path.pop()?.clone().scale(sz);
    this.tileChecker = tileChecker;
  }

  shot() {
    return this.weapon.tryShot(this.attackTarget);
  }

  getAction(hovered: InteractiveObject, mapTile?: number) {
    let action = 'move';
    if (hovered && hovered.player != this.player) {
      action = 'attack';
    }
    else {
      action = 'move';
    }
    return action;
  }

  logic() {
    const units = this.getList().list.filter(it => it instanceof AbstractUnit && it.player != this.player) as AbstractUnit[];
    const builds = this.getList().list.filter(it => it instanceof MapObject && it.player != this.player) as MapObject[];
    const closestUnit = findClosestUnit(this.position.clone(), units);
    const closestBuild = findClosestBuild(this.position.clone(), builds);
    const targetEnemy = closestUnit.distance > closestBuild.distance ? closestBuild : closestUnit;

    if (!this.attackTarget) {
      this.targetEnemy = targetEnemy;
      if (this.targetEnemy.unit instanceof MapObject) {
        this.setTarget(closestBuild.tile)
      }
      else if (this.targetEnemy.unit instanceof AbstractUnit) {
        this.setTarget(closestUnit.unit.position);
      }
    }
    else if (this.targetEnemy.unit.health === 0) {
      this.attackTarget = null;
    }
  }

  findClosestEnemy() {
    const units = this.getList().list.filter(it => it instanceof AbstractUnit && it.player != this.player) as AbstractUnit[];
    const builds = this.getList().list.filter(it => it instanceof MapObject && it.player != this.player) as MapObject[];
    const closestUnit = findClosestUnit(this.position.clone(), units);
    const closestBuild = findClosestBuild(this.position.clone(), builds);
    return closestUnit.distance > closestBuild.distance ? closestBuild : closestUnit;
  }

  damage(point: Vector, tile: Vector, unit: InteractiveObject) {
    //(unit as AbstractUnit).weapon.getDamage()
    const amount = 10;
    const {distance} = getTilingDistance(tile, this.position, [[1]]);
    if (distance === 0) {
      this.health -= amount;
      if (this.health <= 0) {
        this.onDestroyed();
      }
    }
  }

  defineDirection(target: { x: number, y: number }, positionPx: { x: number, y: number }) {
    let direction = ''
    if (target.x < positionPx.x) {
      if (target.y < positionPx.y) {
        direction = 'left-up'
      }
      else if (target.y > positionPx.y) {
        direction = 'left-down'
      }
      else {
        direction = 'left'
      }
    }
    else if (target.x > positionPx.x) {
      if (target.y < positionPx.y) {
        direction = 'right-up'
      }
      else if (target.y > positionPx.y) {
        //right-up
        direction = 'right-down'
      }
      else {
        direction = 'right'
      }
    }
    else if (target.x == positionPx.x) {
      if (target.y < positionPx.y) {
        //down
        direction = 'up'
      }
      else if (target.y > positionPx.y) {
        //up
        direction = 'down'
      }
    }
    return direction
  }

  private reachCorrectSubtile(tile: Tile, currentSubIndex: number, subTileDirection: number) {
    if(currentSubIndex===subTileDirection)return currentSubIndex
    const offset = tile.calculatePosition(subTileDirection)
    const x = tile.coords.x * 55 + offset.x
    const y = tile.coords.y * 55 + offset.y

    this.positionPx = this.positionPx.clone().add(new Vector(x, y).clone()
      .sub(this.positionPx).normalize().scale(this.speed));
    if (Math.abs(Math.ceil(this.positionPx.x) - x) < 2 && Math.abs(Math.ceil(this.positionPx.y) - y) < 2) {
      return subTileDirection
    }
    return false
  }

  stepToNextTile(subTileInNextTile: { x: number; y: number }) {
    // console.log(this.positionPx)

    //console.log('stepToNextTile')
    // this.positionPx=new Vector(200,
    //    100);
    //console.log()
    // this.positionPx = this.positionPx.clone().add(this.target.clone()
    //   .sub(this.positionPx).normalize().scale(this.speed));

    // this.positionPx = new Vector(this.positionPx.x + subTileInNextTile.x,
    //   this.positionPx.y + subTileInNextTile.y);
  }

  private moveInsideTile(tile: Tile, direction: string) {
    const nextSub = tile.defineSubtileByNextStepDirection(direction,
      tile.getIndexByUnit(this),this.tileCollection)
   const reach = !this.subTile && this.reachCorrectSubtile(tile, tile.getIndexByUnit(this), nextSub)
    if (typeof reach === 'number') {
      tile.newSubtileInside(this, tile.getIndexByUnit(this), nextSub)
      return reach
    }
    return false
  }
}
