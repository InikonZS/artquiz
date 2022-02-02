export class ResourceLoader{
  constructor(){

  }

  loadTexture(src:string):Promise<HTMLImageElement>{
    return new Promise((resolve, reject)=>{
      let image = new Image();
      image.onload = ()=>{
        resolve(image)
      }
      image.onerror =(ev)=>{
        reject(ev);
      }
      image.src = src;
    });
  }

  loadTextures(list:Record<string, string>, onProgress?:(loaded:number, count:number)=>void):Promise<Record<string, HTMLImageElement>>{
    const textures: Record<string, HTMLImageElement> = {};
    const textureList = Object.keys(list);
    let loaded = 0;
    let count = textureList.length;

    const loadedTextures = Promise.all(textureList.map(textureName=>this.loadTexture(list[textureName]).then(res=>{
      textures[textureName] = res;
      onProgress?.(loaded, count);
      return null;
    }))).then((results)=>{
      return textures;
    });
    return loadedTextures; 
  }
}