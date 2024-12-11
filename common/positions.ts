export class Position {
  constructor (x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public x = 0;
  public y = 0;
  public add: (v: Vector) => Position = (v: Vector) => {
    return new Position(this.x + v.x, this.y + v.y);
  };

  public sub: (v: Vector) => Position = (v: Vector) => {
    return new Position(this.x - v.x, this.y - v.y);
  };

  public toString: () => string = () => {
    return `(${this.x}, ${this.y})`;
  };
}

export class Vector extends Position {
}
