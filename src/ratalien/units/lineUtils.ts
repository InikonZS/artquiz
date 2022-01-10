import { Vector } from "../../common/vector";

export function onLine(v:Vector, vs:Vector, ve:Vector){
  const dline = vs.clone().sub(ve).abs();
  const dve = v.clone().sub(ve).abs();
  const dvs = v.clone().sub(vs).abs();
  return (dve + dvs) <= dline + 0.00001;
}