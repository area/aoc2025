import { lineByLineGenerator } from './common/lineByLineGenerator';
import { Grid } from './common/grid';
import { orthoganalDirections, diagonalDirections, Position, Vector } from './common/positions';

import { SetWithContentEquality } from './common/setWithContentEquality';

const filePath = './inputs/12.txt';

async function readData (): Promise<{ g: Grid }> {
  const g = new Grid();
  let lineIndex = 0;
  for await (const line of lineByLineGenerator(filePath)) {
    let charIndex = 0;
    for (const c of line.split('')) {
      g.setLetter(new Position(charIndex, lineIndex), c);
      charIndex++;
    }
    lineIndex++;
  }
  return { g };
}

function extractRegion (g: Grid, p: Position): SetWithContentEquality<Position> {
  const region = new SetWithContentEquality<Position>(t => t.toString());
  const stack = [p];
  const plant = g.getLetter(p);
  while (stack.length > 0) {
    const current = stack.pop() as Position;
    if (region.has(current)) {
      continue;
    }
    region.add(current);
    for (const d of orthoganalDirections) {
      const np = current.add(d);
      if (g.getLetter(np) !== plant) {
        continue;
      }
      if (!region.has(np)) {
        stack.push(np);
      }
    }
  }
  return region;
}

function perimeter (region: SetWithContentEquality<Position>): number {
  let perimeter = 0;
  for (const p of region.values()) {
    perimeter += orthoganalDirections.filter(d => !region.has(p.add(d))).length;
  }

  return perimeter;
}

function sides (region: SetWithContentEquality<Position>): number {
  let sides = 0; // is equal to the number of corners
  for (const p of region.values()) {
    for (const d of diagonalDirections) {
      if (!region.has(p.add(new Vector(d.x, 0))) && !region.has(p.add(new Vector(0, d.y)))) {
        // XX
        // XA
        // this is a corner
        sides++;
      }
      if (
        region.has(p.add(new Vector(d.x, 0))) &&
        region.has(p.add(new Vector(0, d.y))) &&
        !region.has(p.add(new Vector(d.x, d.y)))
      ) {
        // XA
        // AA
        // this is a corner
        sides++;
      }
    }
  }

  return sides;
}

async function part1 (): Promise<void> {
  const { g } = await readData();
  let totalPrice = 0;
  for (let y = 0; y < g.height; y++) {
    for (let x = 0; x < g.width; x++) {
      if (g.getLetter(new Position(x, y)) === '#') {
        continue;
      }
      const region = extractRegion(g, new Position(x, y));
      // Mark the region as visited
      region.values().forEach(p => { g.setLetter(p, '#'); });
      totalPrice += region.values().length * perimeter(region);
    }
  }
  console.log(totalPrice);
}

async function part2 (): Promise<void> {
  const { g } = await readData();
  let totalPrice = 0;
  for (let y = 0; y < g.height; y++) {
    for (let x = 0; x < g.width; x++) {
      if (g.getLetter(new Position(x, y)) === '#') {
        continue;
      }
      const region = extractRegion(g, new Position(x, y));
      // Mark the region as visited
      region.values().forEach(p => { g.setLetter(p, '#'); });
      totalPrice += region.values().length * sides(region);
    }
  }
  console.log(totalPrice);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
