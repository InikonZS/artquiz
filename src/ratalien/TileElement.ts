import {Vector} from "../common/vector";
import {IUnitConstructor} from "./units/IUnitConstructor";
import {AbstractUnit} from "./interactives";

export class TilesCollection {
  private tilesMap: Map<string, Tile>;

  constructor() {
    this.tilesMap = new Map()
  }

  addTile(coords: Record<string, number>, value: number) {
    this.tilesMap.set(`${coords.x}-${coords.y}`, new Tile(coords, value))
  }

  setTileBuildValue(vector: Vector, mtx: Array<Array<string>>, status: string) {
    const width = mtx[0].length
    const height = mtx.length
    for (let i = 0; i <= width; i++) {
      for (let j = 0; j <= height; j++) {
        if (mtx[i][j] && mtx[i][j] == '1') {
          const tile = this.tilesMap.get(`${vector.x + j}-${vector.y + i}`)
          status === 'build' ? tile.setTotalOccupancy() : tile.clearTotalOccupancy()
        }
      }
    }

  }

  addBuild(mtx: Array<Array<string>>, vector: Vector) {
    this.setTileBuildValue(vector, mtx, 'build')
  }

  getTileData(key: string) {
    return this.tilesMap.get(key)
  }

  clearSubTile(s: string, unit: AbstractUnit) {
    const tile = this.getTileData(s)
    const subIndex = tile.getIndexByUnit(unit)
    // console.log('subIndex', subIndex)
    subIndex >= 0 && tile.clearSubTile(subIndex)
    return subIndex
  }

  unitChangeTile(unit: AbstractUnit, tileCoordinates: { x: any; y: any },
                 newTile: { x: number; y: number }, direction: string, subtile?: number) {
    const unitPrevSubTile = subtile ? subtile : this.clearSubTile(`${tileCoordinates.x}-${tileCoordinates.y}`, unit)
    const newTileSubTileIndex = subtile ? subtile : this.defineNewSubTileByPrevDirection(
      unitPrevSubTile, direction, newTile)
    if (typeof newTileSubTileIndex == 'number') {
      const _newTile = this.getTileData(`${newTile.x}-${newTile.y}`)
      _newTile.setSubTileUnit(unit, newTileSubTileIndex)
      return _newTile.calculatePosition(newTileSubTileIndex)
    }
    return null
  }


  defineNewSubTileByPrevDirection(prevSubTile: number, direction: string,
                                  _nextTile: { x: number, y: number }) {
    let subtile: number
    const nextX = _nextTile.x
    const nextY = _nextTile.y
    const directions:Record<string, number[]>={
      down: [1,0,2,3],
      up:[2,3,0,1],
      left:[1,3,2,0],
      right:[2,0,1,3]
    }
    if(directions[direction]){
      directions[direction].forEach(dir=>{
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[dir] == null && (subtile = dir)
      })
    }else{
      if (direction === 'left-up') {
        if (prevSubTile === 1
            && this.tilesMap.get(`${nextX}-${nextY - 1}`).subTile[2] == null
            && this.tilesMap.get(`${nextX}-${nextY}`).subTile[1] == null) {
          (subtile = 1)
        }
        else if (prevSubTile === 2
                 && this.tilesMap.get(`${nextX - 1}-${nextY}`).subTile[1] == null
                 && this.tilesMap.get(`${nextX}-${nextY}`).subTile[2] == null) {
          (subtile = 2)
        }
        else {
          this.tilesMap.get(`${nextX}-${nextY}`).subTile[3] == null && (subtile = 3)
        }
      }
      else if (direction === 'right-up') {
        // console.log("Riup")
        if (prevSubTile === 0
            && this.tilesMap.get(`${nextX}-${nextY - 1}`).subTile[3] == null
            && this.tilesMap.get(`${nextX}-${nextY}`).subTile[0] == null) {
          (subtile = 0)
        }
        else if (prevSubTile === 3
                 && this.tilesMap.get(`${nextX + 1}-${nextY}`).subTile[0] == null
                 && this.tilesMap.get(`${nextX}-${nextY}`).subTile[3] == null) {
          (subtile = 3)
        }
        else {
          this.tilesMap.get(`${nextX}-${nextY}`).subTile[2] == null && (subtile = 2)
        }
      }
      else if (direction === 'right-down') {
        if (prevSubTile === 1
            && this.tilesMap.get(`${nextX}-${nextY - 1}`).subTile[2] == null
            && this.tilesMap.get(`${nextX}-${nextY}`).subTile[1] == null) {
          (subtile = 1)
        }
        else if (prevSubTile === 2
                 && this.tilesMap.get(`${nextX - 1}-${nextY}`).subTile[1] == null
                 && this.tilesMap.get(`${nextX}-${nextY}`).subTile[2] == null) {
          (subtile = 2)
        }
        else {
          this.tilesMap.get(`${nextX}-${nextY}`).subTile[0] == null && (subtile = 0)
        }
      }
      else if (direction === 'left-down') {
        if (prevSubTile === 0
            && this.tilesMap.get(`${nextX}-${nextY - 1}`).subTile[3] == null
            && this.tilesMap.get(`${nextX}-${nextY}`).subTile[0] == null) {
          (subtile = 0)
        }
        else if (prevSubTile === 3
                 && this.tilesMap.get(`${nextX - 1}-${nextY}`).subTile[0] == null
                 && this.tilesMap.get(`${nextX}-${nextY}`).subTile[3] == null) {
          (subtile = 3)
        }
        else {
          this.tilesMap.get(`${nextX}-${nextY}`).subTile[1] == null && (subtile = 1)
        }
      }
    }
    return subtile
  }

  findFreeNeighbor(tile: Tile) {
    const {x: currentX, y: currentY} = tile.coords
    const moves: number[][] = [[-1, -1], [1, -1], [-1, 1], [0, -1], [0, 1], [1, 0], [-1, 0]]
    let freeNeib: Tile = null
    for (let i = 0; i < moves.length; i++) {
      if (this.getTileData(`${currentX + moves[i][0]}-${currentY + moves[i][1]}`).occupancyRatio == 0) {
        freeNeib = this.getTileData(`${currentX + moves[i][0]}-${currentY + moves[i][1]}`)
        break
      }
    }
    return freeNeib

  }

  rewriteTiles(tile: Tile, newTile: Tile) {
    const units = tile.subTile
    tile.subTile = [null, null, null, null]
    tile.occupancyRatio = 0
    newTile.subTile = units
    newTile.occupancyRatio = 4
    units.forEach(unit => unit.tileCoordinates = {x: newTile.coords.x, y: newTile.coords.y})
    return units.every(e => e.target === null) && true
  }
}

export class Tile {

  position: Vector
  public occupancyRatio: number;
  public subTile: any[];
  public coords: Record<string, number>;

  constructor(coords: Record<string, number>, value: number) {
    this.coords = coords
    this.occupancyRatio = value
    this.subTile = [null, null, null, null]
  }

  getTileUnits() {
    return this.subTile
  }

  newSubtileInside(unit: AbstractUnit, currentSub: number, newSubtile: number) {
    if (currentSub === newSubtile) {
      // console.log('newSubtileInside',currentSub,newSubtile)
      return this.calculatePosition(newSubtile)
    }
    this.subTile[currentSub] = null
    this.subTile[newSubtile] = unit
    //  console.log('newSubtileInside', this.subTile)
    return this.calculatePosition(newSubtile)
  }

  setTilePosition(_position: Vector) {
    this.position = _position
  }

  getIndexByUnit(unit: AbstractUnit) {
    //console.log(this.subTile)
    return this.subTile.findIndex(e => e === unit)
  }

  calculatePosition(index: number) {
    return index == 1 ? {x: 37, y: 10} : index == 2 ? {x: 10, y: 37} : index == 3 ? {x: 37, y: 37} : {x: 10, y: 10}
  }

  findEmptySubTile() {
    return this.subTile.findIndex(e => !e)
  }

  setSubTileUnit(unit: AbstractUnit, tileIndex?: number) {
    let freeIndex: number
    if (this.occupancyRatio < 4) {
      if (this.subTile[tileIndex] == null) {
        freeIndex = tileIndex
        this.subTile[tileIndex] = unit
        this.occupancyRatio = this.subTile.filter(e => e).length
      }
      else {
        const isHasEmpty = this.subTile.findIndex(e => e == null)
        if (isHasEmpty) {
          this.subTile[isHasEmpty] = unit
          freeIndex = isHasEmpty
          this.occupancyRatio = this.subTile.filter(e => e).length
        }
        else console.log("FULL setSubTileUnit")
      }
    }
    // console.log(this.subTile, '?????')
    return this.calculatePosition(tileIndex)

  }

  clearSubTile(subTileIndex: number) {
    this.subTile[subTileIndex] = null
    this.occupancyRatio = this.subTile.filter(e => e).length
  }

  setTotalOccupancy() {
    this.occupancyRatio = 5
    for (let i = 0; i < this.subTile.length; i++) {
      this.subTile[i] = 5
    }
  }

  clearTotalOccupancy() {
    this.occupancyRatio = 0
    for (let i = 0; i < this.subTile.length; i++) {
      this.subTile[i] = 0
    }
  }

//todo
  //multiselect class

  defineSubtileByNextStepDirection(nextDirection: string, currentSubtile: number,
                                   tilesCollection: TilesCollection) {
    let subtile: number
    // console.log(this.coords,'define SubtileByNextStepDirection')
    if (nextDirection === 'up') {
      currentSubtile === 2 && (subtile = 0)
      currentSubtile === 3 && (subtile = 1)
      currentSubtile === 0 && (subtile = currentSubtile)
      currentSubtile === 1 && (subtile = currentSubtile)
    }
    else if (nextDirection === 'left-up') {
      if (tilesCollection.getTileData(
        `${this.coords.x}-${this.coords.y - 1}`).subTile[2] === null
          && currentSubtile === 1) {
        subtile = 1
      }
      else if (tilesCollection.getTileData(
        `${this.coords.x - 1}-${this.coords.y}`).subTile[1] === null
               && currentSubtile === 2) {
        subtile = 2
      }
      else {
        subtile = 0
      }

    }
    else if (nextDirection === 'right-up') {
      if (tilesCollection.getTileData(
        `${this.coords.x}-${this.coords.y - 1}`).subTile[3] === null
          && currentSubtile === 0) {
        subtile = 0
      }
      else if (tilesCollection.getTileData(
        `${this.coords.x + 1}-${this.coords.y}`).subTile[0] === null
               && currentSubtile === 3) {
        subtile = 3
      }
      else {
        subtile = 1
      }
    }
    else if (nextDirection === 'left') {
      currentSubtile === 1 ? subtile = 0 : currentSubtile === 3 ? subtile = 2 : subtile = currentSubtile
    }
    else if (nextDirection === 'right') {
      currentSubtile === 0 ? subtile = 1 : currentSubtile === 2 ? subtile = 3 : subtile = currentSubtile
    }
    else if (nextDirection === 'down') {
      currentSubtile === 0 ? subtile = 2 :
        currentSubtile === 1 ? subtile = 3 : subtile = currentSubtile
    }
    else if (nextDirection === 'right-down') {
      if (tilesCollection.getTileData(
        `${this.coords.x + 1}-${this.coords.y}`).subTile[2] === null
          && currentSubtile === 1) {
        subtile = 1
      }
      else if (tilesCollection.getTileData(
        `${this.coords.x}-${this.coords.y + 1}`).subTile[1] === null
               && currentSubtile === 2) {
        subtile = 2
      }
      else {
        subtile = 3
      }
    }
    else if (nextDirection === 'left-down') {
      if (tilesCollection.getTileData(
        `${this.coords.x - 1}-${this.coords.y}`).subTile[3] === null
          && currentSubtile === 0) {
        subtile = 0
      }
      else if (tilesCollection.getTileData(
        `${this.coords.x}-${this.coords.y + 1}`).subTile[0] === null
               && currentSubtile === 3) {
        subtile = 3
      }
      else {
        subtile = 2
      }
    }
    // console.log(subtile,'EnddefineSubtileByNextStepDirection')
    return subtile
  }
}