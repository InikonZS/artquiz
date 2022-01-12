import { Vector } from '../../common/vector';
import { getTilingDistance } from '../distance';
import { InteractiveObject } from './interactiveObject';
import { MapObject } from './mapObject';
import { TruckUnit } from './TruckUnit';

export class OreFactory extends MapObject{
  damage(point: Vector, tile: Vector, unit: InteractiveObject) {
 //(unit as AbstractUnit).weapon.getDamage()
    const amount = 10;
    const distance = getTilingDistance(tile, this.position, this.tiles);
    if (distance === 0) {
      //TODO add player
      if (unit instanceof TruckUnit) {
        unit.clearGold();
      }
    }    
  }
}