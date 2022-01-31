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

  // addUnitTile(s: string, unit: AbstractUnit) {
  //   const tile = this.getTileData(s)
  //   console.log(tile,'==',s)
  //   if (tile.occupancyRatio < 4) {
  //     return tile.setSubTileUnit(unit)
  //   }
  //   return {x: 0, y: 0}
  // }

  checkTile(s: string, subTileToNext: number[], unit: AbstractUnit) {
    const tile = this.getTileData(s)
    console.log('til', tile)
    if (tile && tile.occupancyRatio < 4) {
      //проверь если хоть для одного из сабтайлов свободен
      const subTile = subTileToNext.find((e) => !tile.subTile[subTileToNext[e]])
      console.log("checkTile-subTule", subTile)
      if (subTile >= 0) {
        return tile.setSubTileUnit(unit, subTileToNext[subTile])
      }
      else {//либо займи любую свободную
        const index = tile.findEmptySubTile()
        return tile.setSubTileUnit(unit, subTileToNext[index])
      }
    }
    else {
      return null
    }
  }

  clearSubTile(s: string, unit: AbstractUnit) {
    const tile = this.getTileData(s)
    //console.log("@@@",tile)
    const subIndex = tile.getIndexByUnit(unit)
     console.log('subIndex',subIndex)
    subIndex >= 0 && tile.clearSubTile(subIndex)
    return subIndex
  }

  unitChangeTile(unit: AbstractUnit, tileCoordinates: { x: any; y: any },
                 newTile: { x: number; y: number }, direction: string) {
    //console.log('unitChangeTile')
    const unitPrevSubTile = this.clearSubTile(`${tileCoordinates.x}-${tileCoordinates.y}`, unit)

    const newTileSubTileIndex = this.defineNewSubTileByPrevDirection(
      unitPrevSubTile, direction, newTile)
    console.log('NewTile',this.getTileData(`${newTile.x}-${newTile.y}`))
    console.log('oldTile',this.getTileData(`${tileCoordinates.x}-${tileCoordinates.y}`))
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
    //console.log(nextX,'& &',nextY)
    if (direction === 'up') {
      if (prevSubTile === 3) {
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[0] == null && (subtile = 0)
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[1] == null && (subtile = 1)
      }
      else if (prevSubTile === 2) {
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[1] == null && (subtile = 1)
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[0] == null && (subtile = 0)
      }
    }
    else if (direction === 'left-up') {
      this.tilesMap.get(`${nextX}-${nextY}`).subTile[3] == null && (subtile = 3)
    }
    else if (direction === 'right-up') {
      this.tilesMap.get(`${nextX}-${nextY}`).subTile[2] == null && (subtile = 2)
    }
    else if (direction === 'left') {
      if (prevSubTile === 0) {
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[3] == null && (subtile = 3)
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[1] == null && (subtile = 1)
      }
      else if (prevSubTile === 2) {
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[3] == null && (subtile = 3)
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[1] == null && (subtile = 1)
      }
    }
    else if (direction === 'right') {
      if (prevSubTile === 1) {
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[2] == null && (subtile = 2)
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[0] == null && (subtile = 0)
      }
      else if (prevSubTile === 3) {
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[0] == null && (subtile = 0)
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[2] == null && (subtile = 2)
      }
    }
    else if (direction === 'down') {
      if (prevSubTile === 2) {
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[1] == null && (subtile = 1)
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[0] == null && (subtile = 0)
      }
      else if (prevSubTile === 3) {
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[0] == null && (subtile = 0)
        this.tilesMap.get(`${nextX}-${nextY}`).subTile[1] == null && (subtile = 1)
      }
    }
    else if (direction === 'right-down') {
      this.tilesMap.get(`${nextX}-${nextY}`).subTile[0] == null && (subtile = 0)
    }
    else if (direction === 'left-down') {
      this.tilesMap.get(`${nextX}-${nextY}`).subTile[1] == null && (subtile = 1)
    }
    // console.log("&&",subtile,'&&')
    return subtile
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

  newSubtileInside(unit: AbstractUnit, currentSub: number, newSubtile: number) {

    this.subTile[currentSub] = null
    this.subTile[newSubtile] = unit
  //  console.log('newSubtileInside', this.subTile)
    return this.calculatePosition(newSubtile)
  }

  setTilePosition(_position: Vector) {
    this.position = _position
  }

  getIndexByUnit(unit: AbstractUnit) {
    return this.subTile.findIndex(e => e === unit)
  }

  calculatePosition(index: number) {
    return index == 1 ? {x: 37, y: 10} : index == 2 ? {x: 10, y: 37} : index == 3 ? {x: 37, y: 37} : {x: 10, y: 10}
  }

  findEmptySubTile() {
    return this.subTile.findIndex(e => !e)
  }

  setSubTileUnit(unit: AbstractUnit, tileIndex?: number) {
    console.log(tileIndex, 'INDEX setSubTileUnit')
    let freeIndex: number
    if (this.occupancyRatio < 4) {
      if (this.subTile[tileIndex] == null) {
        freeIndex = tileIndex
        this.subTile[tileIndex] = unit
        this.occupancyRatio = this.subTile.filter(e=>e).length
      }
      else {
        const isHasEmpty = this.subTile.findIndex(e => e == null)
        if (isHasEmpty) {
          this.subTile[isHasEmpty] = unit
          freeIndex = isHasEmpty
          this.occupancyRatio = this.subTile.filter(e=>e).length
        }
        else console.log("FULL setSubTileUnit")
      }
    }
    return this.calculatePosition(tileIndex)

  }

  clearSubTile(subTileIndex: number) {
     this.subTile[subTileIndex] = null
    this.occupancyRatio = this.subTile.filter(e=>e).length
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

  defineSubtileByNextStepDirection(nextDirection: string, currentSubtile: number) {
    let subtile: number
    if (nextDirection === 'up') {
      currentSubtile === 2 ? (subtile = 0) :
        currentSubtile === 3 ? (subtile = 1) : subtile = currentSubtile
    }
    else if (nextDirection === 'left-up') {
      subtile = 0
    }
    else if (nextDirection === 'right-up') {
      subtile = 1
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
      subtile = 3
    }
    else if (nextDirection === 'left-down') {
      subtile = 2
    }
    return subtile
  }
}