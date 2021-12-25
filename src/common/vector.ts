export interface IVector{
  x:number;
  y:number;
}

export class Vector {
  public x: number;
  public y: number;

  constructor(x:number, y:number) {
      this.x = x;
      this.y = y;
  }

  clone() {
      return new Vector(this.x, this.y);
  }

  add(vector) {
      this.x += vector.x;
      this.y += vector.y;
      return this;
  }

  sub(vector) {
      this.x -= vector.x;
      this.y -= vector.y;
      return this;
  }

  scale(scaler) {
      this.x *= scaler;
      this.y *= scaler;
      return this;
  }

  normalize() {
      let abs = this.abs();
      if (!Number.isNaN(abs) && abs != 0) {
          this.scale(1 / abs);
      }
      return this;
  }

  abs() {
      return Math.pow((Math.pow(this.x, 2) + Math.pow(this.y, 2)), 0.5);
  }

}