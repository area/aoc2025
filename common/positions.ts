import { type Comparable } from './comparable';

export class Position implements Comparable {
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

  public equals (other: Comparable): boolean {
    if (!(other instanceof Position)) {
      return false;
    }
    return this.x === other.x && this.y === other.y;
  }

  public manhattanDistance (other: Position): number {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }
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
