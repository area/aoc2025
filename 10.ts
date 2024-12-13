import { Grid } from './common/grid';
import { lineByLineGenerator } from './common/lineByLineGenerator';
import { Position } from './common/positions';

const filePath = './inputs/10.txt';

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

const orthoganalDirections = [
  new Position(0, -1),
  new Position(1, 0),
  new Position(0, 1),
  new Position(-1, 0),
];

function findReachableSummits (g: Grid, start: Position): Set<string> {
  const paths = [];
  const reachableSummits = [];
  paths.push(start);
  while (paths.length > 0) {
    const p = paths.pop() as Position;
    if (g.getLetter(p) === '9') {
      reachableSummits.push(p);
      continue;
    }

    for (const d of orthoganalDirections) {
      const np = p.add(d);
      if (parseInt(g.getLetter(np)) === parseInt(g.getLetter(p)) + 1) {
        paths.push(np);
      }
    }
  }
  const s = new Set<string>();
  for (const rs of reachableSummits) {
    s.add(rs.toString());
  }
  return s;
}

function findCompletePaths (g: Grid, start: Position): Position[][] {
  const paths: Position[][] = [];
  const completePaths = [];
  paths.push([start]);
  while (paths.length > 0) {
    const p = paths.pop() as Position[];
    if (g.getLetter(p[p.length - 1]) === '9') {
      completePaths.push(p);
      continue;
    }

    for (const d of orthoganalDirections) {
      const np = p[p.length - 1].add(d);
      if (parseInt(g.getLetter(np)) === parseInt(g.getLetter(p[p.length - 1])) + 1) {
        const duplicate = p.map((pp) => new Position(pp.x, pp.y));
        paths.push([...duplicate, np]);
      }
    }
  }
  return completePaths;
}

async function part1 (): Promise<void> {
  const { g } = await readData();

  let mapScore = 0;
  for (let y = 0; y < g.height; y++) {
    for (let x = 0; x < g.width; x++) {
      if (g.getLetter(new Position(x, y)) === '0') {
        const reachableSummits = findReachableSummits(g, new Position(x, y));
        mapScore += reachableSummits.size;
      }
    }
  }
  console.log(mapScore);
}

async function part2 (): Promise<void> {
  const { g } = await readData();

  let mapScore = 0;
  for (let y = 0; y < g.height; y++) {
    for (let x = 0; x < g.width; x++) {
      if (g.getLetter(new Position(x, y)) === '0') {
        const completePaths = findCompletePaths(g, new Position(x, y));
        mapScore += completePaths.length;
      }
    }
  }
  console.log(mapScore);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
