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

export const orthoganalDirections = [
  new Position(0, -1),
  new Position(1, 0),
  new Position(0, 1),
  new Position(-1, 0),
];

export const diagonalDirections = [
  new Position(1, -1),
  new Position(1, 1),
  new Position(-1, 1),
  new Position(-1, -1),
];