import { lineByLineGenerator } from './common/lineByLineGenerator';

const filePath = './inputs/06.txt';

interface Position { x: number, y: number }
type Vector = Position;

class Grid {
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
        s += this.grid[x][y];
      }
      s += '\n';
    }
    return s;
  }
}

class Guard {
  public position: Position = { x: 0, y: 0 };
  public direction: Vector = { x: 0, y: 0 };
}

class Situation {
  public guard: Guard = new Guard();
  public grid: Grid = new Grid();
}

function add (a: Position, b: Vector): Position {
  return { x: a.x + b.x, y: a.y + b.y };
}

async function setupSituation (filePath: string): Promise<Situation> {
  const g = new Grid();
  const guard = new Guard();

  const lineByLine = lineByLineGenerator(filePath);
  let lineNumber = 0;
  for await (const line of lineByLine) {
    let charNumber = 0;
    for (const char of line) {
      if (char === '^') {
        guard.position = { x: charNumber, y: lineNumber };
        guard.direction = { x: 0, y: -1 };
        g.setLetter({ x: charNumber, y: lineNumber }, 'X');
      } else {
        g.setLetter({ x: charNumber, y: lineNumber }, char);
      }
      charNumber++;
    }
    lineNumber++;
  }
  return { guard, grid: g };
}

function moveGuard (s: Situation): void {
  // Mark where the guard currently is
  s.grid.setLetter(s.guard.position, 'X');
  // Move the guard
  while (s.grid.getLetter(add(s.guard.position, s.guard.direction)) === '#') {
    // Turn the guard right
    if (s.guard.direction.x === 0) {
      s.guard.direction = { x: -s.guard.direction.y, y: 0 };
    } else {
      s.guard.direction = { x: 0, y: s.guard.direction.x };
    }
  }
  s.guard.position.x += s.guard.direction.x;
  s.guard.position.y += s.guard.direction.y;
}

async function part1 (): Promise<void> {
  const s = await setupSituation(filePath);

  while (s.guard.position.x >= 0 && s.guard.position.y >= 0 && s.guard.position.x < s.grid.width && s.guard.position.y < s.grid.height) {
    moveGuard(s);
  }

  console.log(s.grid.toString().match(/X/g)?.length);
}

async function part2 (): Promise<void> {
  let s = await setupSituation(filePath);
  let nLoops = 0;
  // Could only check putting obstacles on the original path...
  for (let i = 0; i < s.grid.width; i++) {
    for (let j = 0; j < s.grid.height; j++) {
      s = await setupSituation(filePath);
      if (s.grid.getLetter({ x: i, y: j }) !== '.') {
        continue;
      } else {
        s.grid.setLetter({ x: i, y: j }, '#');
      }
      const historicalStates = new Set<string>();
      while (s.guard.position.x >= 0 && s.guard.position.y >= 0 && s.guard.position.x < s.grid.width && s.guard.position.y < s.grid.height) {
        moveGuard(s);
        // It's a loop if we've been on the same square heading in the same direction
        const state = `${s.guard.position.x},${s.guard.position.y},${s.guard.direction.x},${s.guard.direction.y}`;
        if (historicalStates.has(state)) {
          nLoops++;
          break;
        } else {
          historicalStates.add(state);
        }
      }
    }
  }
  console.log(nLoops);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
