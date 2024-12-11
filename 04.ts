import { lineByLineGenerator } from './common/lineByLineGenerator';
import { Vector, Position } from './common/positions';

const filePath = './inputs/04.txt';

class WordsearchGrid {
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
    return this.grid[p.x][p.y];
  }

  public matchWord (word: string, position: Position, direction: Vector): boolean {
    for (let i = 0; i < word.length; i++) {
      const p = { x: position.x + direction.x * i, y: position.y + direction.y * i };
      if (this.grid[p.x] === undefined || this.grid[p.x][p.y] === '') {
        return false;
      }
      if (this.grid[p.x][p.y] !== word[i]) {
        return false;
      }
    }
    return true;
  }
}

async function setupWordsearchGrid (filePath: string): Promise<WordsearchGrid> {
  const g = new WordsearchGrid();
  const lineByLine = lineByLineGenerator(filePath);
  let lineNumber = 0;
  for await (const line of lineByLine) {
    let charNumber = 0;
    for (const char of line) {
      g.setLetter(new Position(charNumber, lineNumber), char);
      charNumber++;
    }
    lineNumber++;
  }
  return g;
}

const diagonals = [
  new Vector(1, 1),
  new Vector(1, -1),
  new Vector(-1, 1),
  new Vector(-1, -1),
];

const directions = [
  ...diagonals,
  new Vector(1, 0),
  new Vector(0, 1),
  new Vector(-1, 0),
  new Vector(0, -1),
];

async function part1 (): Promise<void> {
  const g = await setupWordsearchGrid(filePath);
  let count = 0;

  for (let y = 0; y < g.height; y++) {
    for (let x = 0; x < g.width; x++) {
      for (const direction of directions) {
        if (g.matchWord('XMAS', new Position(x, y), direction)) {
          count++;
        }
      }
    }
  }

  console.log(count);
}

async function part2 (): Promise<void> {
  const g = await setupWordsearchGrid(filePath);

  let count = 0;

  for (let y = 0; y < g.height; y++) {
    for (let x = 0; x < g.width; x++) {
      for (const diagonal of diagonals) {
        if (g.matchWord('MAS', new Vector(x, y), diagonal)) {
          // Check if there's a MAS going the other way, in either direction
          // Work out where the A is
          const a = new Position(x + diagonal.x, y + diagonal.y);

          // Work out the possible start locations of the other MAS
          const p1: Vector = a.add(new Vector(-diagonal.x, diagonal.y));
          const p2 = a.add(new Vector(diagonal.x, -diagonal.y));
          // See if it's a MAS either way
          if (g.matchWord('MAS', p1, new Vector(diagonal.x, -diagonal.y))) {
            count++;
          } else if (g.matchWord('MAS', p2, new Vector(-diagonal.x, diagonal.y))) {
            count++;
          }
        }
      }
    }
  }
  // Divide count by two, because we'll have seen each X-MAS twice
  console.log(count / 2);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
