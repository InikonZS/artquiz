import Point from '../../web_app/src/point';
export interface IThing {
  id: string;
  user: string;
  point: Point;
  icon: string;
  color: string;
  isLocale?: boolean;
}
export interface IPlayer {
  id?: string;
  name?: string;
  thingsList?: IThing[];
}
