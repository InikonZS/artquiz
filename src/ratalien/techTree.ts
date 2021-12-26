//root
const buildingCenter = {
  deps: ['rootAccess'],
  desc: ['building center'],
  energy: 0,
  cost: 2000,
  time: 100
}

//low
const energyPlant = {
  deps: ['buildingCenter'],
  desc: ['energy plant'],
  energy: -5,
  cost: 200,
  time: 10,
}

//medium
const barracs = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['barracs'],
  energy: 3,
  cost: 400,
  time: 10
}

const dogHouse = {
  deps: ['buildingCenter', 'energyPlant', 'barracs'],
  desc: ['dog house'],
  energy: 2,
  cost: 200,
  time: 10
}

const oreFactory = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['ore factory'],
  energy: 5,
  cost: 1000,
  time: 50
}

const oreBarrel = {
  deps: ['buildingCenter', 'energyPlant', 'oreFactory'],
  desc: ['ore factory'],
  energy: 1,
  cost: 100,
  time: 5
}

const carFactory = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['car factory'],
  energy: 5,
  cost: 1500,
  time: 50
}

const bigEnergyPlant = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['energy center'],
  energy: -12,
  cost: 400,
  time: 20
}

const defendTower = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['defend tower'],
  energy: 5,
  cost: 1000,
  time: 30
}

//high
const radar = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['radar'],
  energy: 10,
  cost: 1000,
  time: 50
}

const repairStation = {
  deps: ['buildingCenter', 'energyPlant'],
  desc: ['repair station'],
  energy: 10,
  cost: 1500,
  time: 50
}

const techCenter = {
  deps: ['buildingCenter', 'energyPlant', "radar", "repairStation"],
  desc: ['tech center'],
  energy: 10,
  cost: 1500,
  time: 100
}

//units
const solder = {
  deps: ["barracs"],
  spawn: ["barracs"],
  cost: 100,
  time: 5
}

const dog = {
  deps: ["dogHouse"],
  spawn: ["dogHouse"],
  cost: 150,
  time: 5
}

const tank = {
  deps: ["carFactory"],
  spawn: ["carFactory"],
  cost: 700,
  time: 20
}

const truck = {
  deps: ["carFactory"],
  spawn: ["carFactory"],
  cost: 1000,
  time: 30
}

const heavyTank = {
  deps: ["carFactory", "techCenter"],
  spawn: ["carFactory"],
  cost: 1500,
  time: 50
}

const bomber = {
  deps: ["barracs", "techCenter"],
  spawn: ["barracs"],
  cost: 1000,
  time: 20
}

export const tech = {
  biulds:{
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
  },
  units:{
    solder,
    truck,
    bomber,
    tank,
    heavyTank,
    dog
  }
}

