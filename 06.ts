import { lineByLineGenerator } from './common/lineByLineGenerator';

import { Position, Vector } from './common/positions';
import { Grid } from './common/grid';

const filePath = './inputs/06.txt';

class Guard {
  public position: Position = new Position(0, 0);
  public direction: Vector = new Vector(0, 0);
}

class Situation {
  public guard: Guard = new Guard();
  public grid: Grid = new Grid();
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
        guard.position = new Position(charNumber, lineNumber);
        guard.direction = new Vector(0, -1);
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
  while (s.grid.getLetter(s.guard.position.add(s.guard.direction)) === '#') {
    // Turn the guard right
    if (s.guard.direction.x === 0) {
      s.guard.direction = new Vector(-s.guard.direction.y, 0);
    } else {
      s.guard.direction = new Vector(0, s.guard.direction.x);
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
