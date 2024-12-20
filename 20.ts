import { lineByLineGenerator } from './common/lineByLineGenerator';
import { orthoganalDirections, Position, Vector } from './common/positions';
import { Grid } from './common/grid';
import { aStar } from './common/astar';

const filePath = './inputs/20.txt';

async function setupGrid (filePath: string): Promise<{ g: Grid, start: Position, end: Position }> {
  const g = new Grid();
  let start;
  let end;

  let rowIdx = 0;
  for await (const line of lineByLineGenerator(filePath)) {
    let charIdx = 0;
    for (const c of line) {
      g.setLetter(new Position(charIdx, rowIdx), c);
      if (c === 'S') {
        start = new Position(charIdx, rowIdx);
        g.setLetter(start, '.');
      }
      if (c === 'E') {
        end = new Position(charIdx, rowIdx);
        g.setLetter(end, '.');
      }
      charIdx += 1;
    }
    rowIdx += 1;
  }

  if (start === undefined || end === undefined) {
    throw new Error('Start or end not found');
  }

  return { g, start, end };
}

function findPath (g: Grid, start: Position, end: Position): Position[] {
  const path = aStar(
    start,
    end,
    (p: Position) => p.manhattanDistance(end),
    (p: Position) => {
      const neighbors: Position[] = [];
      for (const direction of orthoganalDirections) {
        const neighbor = p.add(direction);
        if (g.getLetter(neighbor) !== '#') {
          neighbors.push(neighbor);
        }
      }
      return neighbors;
    },
    function (p: Position, q: Position, cameFrom: Map<string, Position>): number {
      return 1;
    },
  );
  return path;
}

async function part1 (): Promise<void> {
  const { g, start, end } = await setupGrid(filePath);
  const distances = new Map<string, number>();
  const xStep = new Vector(1, 0);
  const yStep = new Vector(0, 1);
  const savings = new Map<number, number>();

  const path = findPath(g, start, end);
  for (let i = 0; i < path.length; i++) {
    distances.set(path[i].toString(), i);
  }

  for (let i = 0; i < g.width; i++) {
    for (let j = 0; j < g.height; j++) {
      const p = new Position(i, j);
      if (g.getLetter(p) !== '#') {
        continue;
      }
      if (g.getLetter(p.add(xStep)) === '.' && g.getLetter(p.sub(xStep)) === '.') {
        // How much does it save?
        const saved = Math.abs(distances.get(p.add(xStep).toString()) - distances.get(p.sub(xStep).toString())) - 2;
        if (isNaN(saved)) {
          console.log(p.add(xStep).toString(), p.sub(xStep).toString());
          console.log(distances.get(p.add(xStep).toString()), distances.get(p.sub(xStep).toString()));
          process.exit(1);
        }
        if (!savings.has(saved)) {
          savings.set(saved, 0);
        }
        savings.set(saved, savings.get(saved) as number + 1);
      }
      if (g.getLetter(p.add(yStep)) === '.' && g.getLetter(p.sub(yStep)) === '.') {
        // How much does it save?
        const saved = Math.abs(distances.get(p.add(yStep).toString()) - distances.get(p.sub(yStep).toString())) - 2;
        if (!savings.has(saved)) {
          savings.set(saved, 0);
        }
        savings.set(saved, savings.get(saved) as number + 1);
      }
    }
  }
  // console.log(savings);
  // What is the sum of all values in savings of keys that are over 100?
  let total = 0;
  for (const [key, value] of savings) {
    if (key >= 100) { // 20 for test; 100 for real
      total += value;
    }
  }
  console.log(total);
}

async function part2 (): Promise<void> {
  const { g, start, end } = await setupGrid(filePath);
  const distances = new Map<string, number>();
  const savings = new Map<number, number>();

  const path = findPath(g, start, end);
  for (let i = 0; i < path.length; i++) {
    distances.set(path[i].toString(), i);
  }

  for (const [idx, p] of path.entries()) {
    for (const q of path.slice(idx + 1)) {
      const distance1 = distances.get(p.toString());
      const distance2 = distances.get(q.toString());
      if (distance1 === undefined || distance2 === undefined) {
        throw new Error('Distance not found');
      }

      if (p.manhattanDistance(q) > 20) {
        continue;
      }

      // Valid cheat. What does it save?
      const saved = distance2 - distance1 - q.manhattanDistance(p);
      if (!savings.has(saved)) {
        savings.set(saved, 0);
      }
      savings.set(saved, savings.get(saved) as number + 1);
    }
  }

  // What is the sum of all values in savings of keys that are over 100?
  let total = 0;
  for (const [key, value] of savings) {
    if (key >= 100) {
      total += value;
    }
  }
  console.log(total);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
