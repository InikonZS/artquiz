import { ResourceLoader } from './loader';
import grass from './sprites/grass.png';
import rocks from './sprites/tree2.png';
import goldFull from './sprites/gold_full.png';
import goldLow from './sprites/gold_low.png';
import goldMed from './sprites/gold_med.png';
import goldMin from './sprites/gold_min.png';

import plant from './sprites/plant.png';
import carFactory from './sprites/carFactory.png';
import buildingCenter from './sprites/buildingCenter.png';

import barac from './sprites/barac.png';
import radar from './sprites/radar.png';
import energy from './sprites/energy.png';
import defendedTower from './sprites/defendedTower.png'

import map from './map96g.png';

import explosion from './sprites/explosion_1.png'



export const resourceLoader = new ResourceLoader();

export const resources = {
  map: map,
  grass: grass,
  rocks: rocks, 
  goldFull: goldFull,
  goldLow: goldLow,
  goldMed: goldMed,
  goldMin: goldMin,
  plant: plant,
  energy:energy,
  radar:radar,
  carFactory:carFactory,
  barac:barac,
  defendedTower:defendedTower,
  buildingCenter:buildingCenter,
  explosion: explosion
}