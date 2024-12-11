import type { Position } from './positions';

export class Grid {
  private readonly grid: Record<number, Record<number, string>> = {};

  public width = 0;
  public height = 0;

  public setLetter (p: Position, letter: string): void {
    if (this.grid[p.x] === undefined) {
      this.grid[p.x] = {};
    }
    this.grid[p.x][p.y] = letter;
    if (p.x >= this.width) {
      this.width = p.x + 1;
    }
    if (p.y >= this.height) {
      this.height = p.y + 1;
    }
  }

  public getLetter (p: Position): string {
    if (this.grid[p.x]?.[p.y] === undefined) {
      return '';
    }
    return this.grid[p.x][p.y];
  }

  public toString (): string {
    let s = '';
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[x]?.[y] === undefined) {
          continue;
        } else {
          s += this.grid[x][y];
        }
      }
      s += '\n';
    }
    return s;
  }
}
