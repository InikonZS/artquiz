import mapsData from '../ratalien/maps.json';

export interface IMapsData{
  size: string,
  players: number,
  name: string,
  src: string
}

export class MapsModel{
 // private questionsPerCategory = 10;
  data: Array<IMapsData>;

  constructor(){

  }

  public async build(){
    this.data = await this.loadImagesData(mapsData);
    console.log(this.data);
    return this.data;
  }

  public loadImagesData(url:string): Promise<Array<IMapsData>>{
    return fetch(url).then(res=>res.json()).then((mapsData: IMapsData[])=>{
      const modelData: Array<IMapsData> = mapsData.map(item=>{
        const record: IMapsData = {
          size: item.size,
          players: item.players,
          name: item.name,
          src: item.src
        };
        return record;
      });
      //console.log(modelData)
      return modelData;
    });
  }
}