export interface ITechBuild{
  deps: string[];
  desc: string[];
  name: string;
  energy: number;
  cost: number;
  time: number;
  mtx:Array<Array<string>>;
}
