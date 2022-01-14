//root
const buildingCenter = {
  deps: ['rootAccess'],
  desc: ['buildingCenter'],
  name: 'buildingCenter',
  energy: 0,
  cost: 2000,
  time: 100,
  mtx:[
    '0000'.split(''),
    '0110'.split(''),
    '1111'.split(''),
    '1111'.split(''),
  ]
}

//low
const energyPlant = {
  deps: ['buildingCenter'],
  desc: ['energyPlant'],
  name: 'energyPlant',
  energy: -5,
  cost: 200,
  time: 10,
  mtx: [
    '0000'.split(''),
    '1100'.split(''),
    '1111'.split(''),
    '1111'.split(''),
  ]
}

//medium
const barracs = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['barracs'],
  name: 'barracs',
  energy: 3,
  cost: 400,
  time: 10,
  mtx: [
    '0011'.split(''),
    '0011'.split(''),
    '1111'.split(''),
    '0011'.split(''),
  ]
}

const dogHouse = {
  deps: ['buildingCenter', 'energyPlant', 'barracs'],
  desc: ['dogHouse'],
  name: 'dogHouse',
  energy: 2,
  cost: 200,
  time: 10,
  mtx: [
    '0110'.split(''),
    '0110'.split(''),
    '0000'.split(''),
    '0000'.split(''),
  ]
}

const oreFactory = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['oreFactory'],
  name: 'oreFactory',
  energy: 5,
  cost: 1000,
  time: 50,
  mtx: [
    '0110'.split(''),
    '0110'.split(''),
    '1111'.split(''),
    '1111'.split(''),
  ]
}

const oreBarrel = {
  deps: ['buildingCenter', 'energyPlant', 'oreFactory'],
  desc: ['oreBarrel'],
  name: 'oreBarrel',
  energy: 1,
  cost: 100,
  time: 5,
  mtx: [
    '0110'.split(''),
    '0110'.split(''),
    '0000'.split(''),
    '0000'.split(''),
  ]
}

const carFactory = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['carFactory'],
  name: 'carFactory',
  energy: 5,
  cost: 1500,
  time: 50,
  mtx: [
    '0110'.split(''),
    '0111'.split(''),
    '1111'.split(''),
    '0000'.split(''),
  ]
}

const bigEnergyPlant = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['energyCenter'],
  name: 'energyCenter',
  energy: -12,
  cost: 400,
  time: 20,
  mtx: [
    '0110'.split(''),
    '0110'.split(''),
    '0110'.split(''),
    '0110'.split(''),
  ]
}

const defendTower = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['defendTower'],
  name: 'defendTower',
  energy: 5,
  cost: 1000,
  time: 30,
  mtx: [
    '0110'.split(''),
    '0110'.split(''),
    '0000'.split(''),
    '0000'.split(''),
  ]
}

//high
const radar = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['radar'],
  name: 'radar',
  energy: 10,
  cost: 1000,
  time: 50,
  mtx: [
    '0111'.split(''),
    '0111'.split(''),
    '0000'.split(''),
    '0000'.split(''),
  ]
}

const repairStation = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['repairStation'],
  name: 'repairStation',
  energy: 10,
  cost: 1500,
  time: 50,
  mtx: [
    '0111'.split(''),
    '0111'.split(''),
    '0111'.split(''),
    '0000'.split(''),
  ]
}

const techCenter = {
  deps: ['buildingCenter', 'energyPlant', "radar", "repairStation"],
  desc: ['techCenter'],
  name: 'techCenter',
  energy: 10,
  cost: 1500,
  time: 100,
  mtx: [
    '0110'.split(''),
    '1111'.split(''),
    '0110'.split(''),
    '0000'.split(''),
  ]
}

//units
const solder = {
  deps: ["barracs"],
  spawn: ["barracs"],
  name: 'solder',
  cost: 100,
  time: 5,
  radius: 10,
  speed: 5,
  minRadius: 0, 
  reloadingTime: 5,
}

const dog = {
  deps: ["dogHouse"],
  spawn: ["dogHouse"],
  name: 'dog',
  cost: 150,
  time: 5,
  radius: 0,
  speed: 7,
  minRadius: 0, 
  reloadingTime: 5,
}

const tank = {
  deps: ["carFactory"],
  spawn: ["carFactory"],
  name: 'tank',
  cost: 700,
  time: 20,
  radius: 20,
  speed: 10,
  minRadius: 10, 
  reloadingTime: 20,
}

const truck = {
  deps: ["carFactory"],
  spawn: ["carFactory"],
  name: 'truck',
  cost: 1000,
  time: 30,
  radius: 20,
  speed: 40,
  minRadius: 5, 
  reloadingTime: 15,
}

const heavyTank = {
  deps: ["carFactory", "techCenter"],
  spawn: ["carFactory"],
  name: 'heavyTank',
  cost: 1500,
  time: 50,
  radius: 30,
  speed: 10,
  minRadius: 5, 
  reloadingTime: 30,
}

const bomber = {
  deps: ["barracs", "techCenter"],
  spawn: ["barracs"],
  name: 'bomber',
  cost: 1000,
  time: 20,
  radius: 50,
  speed: 50,
  minRadius: 0, 
  reloadingTime: 35,
}

export const tech = {
  builds:[
    buildingCenter,
    barracs,
    energyPlant,
    bigEnergyPlant,
    dogHouse,
    carFactory,
    techCenter,
    radar,
    repairStation,
    oreBarrel,
    oreFactory,
    defendTower
  ],
  units:[
    solder,
    truck,
    bomber,
    tank,
    heavyTank,
    dog
  ]
}

