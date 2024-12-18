import { aStar } from './common/astar';
import { Grid } from './common/grid';
import { lineByLineGenerator } from './common/lineByLineGenerator';
import { Position, Vector, orthoganalDirections } from './common/positions';
import { Queue } from './common/queue';

const filePath = './inputs/16.txt';

const pathCostCache = new Map<string, number>();
function getPathCost (p: Position[]): number {
  if (pathCostCache.has(p.map(p => p.toString()).join(','))) {
    // console.log('cache hit');
    return pathCostCache.get(p.map(p => p.toString()).join(',')) as number;
  }
  let facing = new Vector(1, 0);
  if (p.length === 1) {
    return 0;
  } else if (p.length === 2) {
    facing = new Vector(1, 0);
  } else if (p.length >= 3) {
    const l = p.length;
    facing = p[l - 2].sub(p[l - 3]);
  } else {
    throw new Error('Invalid path');
  }

  const stepCost = p[p.length - 1].sub(p[p.length - 2]).equals(facing) ? 1 : 1001;
  const pathCost = getPathCost(p.slice(0, p.length - 1)) + stepCost;
  pathCostCache.set(p.map(p => p.toString()).join(','), pathCost);
  return pathCost;
}

async function readGridFromFile (filePath: string): Promise<{ grid: Grid, start: Position, end: Position }> {
  const g = new Grid();
  let start = new Position(0, 0);
  let end = new Position(0, 0);
  let rowIdx = 0;
  for await (const line of lineByLineGenerator(filePath)) {
    let charIdx = 0;
    for (const char of line) {
      g.setLetter(new Position(charIdx, rowIdx), char);
      if (char === 'S') {
        start = new Position(charIdx, rowIdx);
      } else if (char === 'E') {
        end = new Position(charIdx, rowIdx);
      }
      charIdx += 1;
    }
    rowIdx += 1;
  }
  return { grid: g, start, end };
}

async function part1 (): Promise<number> {
  const { grid: g, start, end } = await readGridFromFile(filePath);

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
      let o = cameFrom.get(p.toString());
      if (o === undefined) {
        o = new Position(0, start.y);
      }
      // 180 is not accurate but... not needed?
      if ((o.x === p.x && p.x === q.x) || (o.y === p.y && p.y === q.y)) {
        return 1;
      }
      return 1001;
    },
  );

  const cost = getPathCost(path);

  console.log(cost);
  return cost;
}

async function part2 (): Promise<void> {
  const { grid: g, start, end } = await readGridFromFile(filePath);
  const pathsToTest = new Queue<Position[]>();
  let optimalPaths: Position[][] = [];
  // const optimalPathCost = await part1();
  const bestScoreToLocation = new Map<string, number>();
  // console.log(optimalPathCost);
  pathsToTest.enqueue([start]);
  while (pathsToTest.length() > 0) {
    // const { grid: hrid } = await readGridFromFile(filePath);
    // for (const pathToTest of pathsToTest.items) {
    //   for (const position of pathToTest) {
    //     hrid.setLetter(position, 'O');
    //   }
    // }
    // console.log(hrid.toString());
    const currentPath = pathsToTest.dequeue();
    if (currentPath === undefined) {
      throw new Error('Invalid currentPath');
    }
    for (const direction of orthoganalDirections) {
      const lastPosition = currentPath[currentPath.length - 1];
      const nextPosition = lastPosition.add(direction);

      if (g.getLetter(nextPosition) !== '#') {
        const newPath = [...currentPath, nextPosition];
        const newPathCost = getPathCost(newPath);
        const key = `${nextPosition.toString()}${nextPosition.sub(lastPosition).toString()}`;
        const bestScoreSeenBefore = bestScoreToLocation.get(key);
        // console.log(getPathCost(newPath), optimalPathCost);
        if (bestScoreSeenBefore !== undefined && bestScoreSeenBefore < newPathCost) {
          continue;
        } else if (nextPosition.equals(end)) {
          if (bestScoreSeenBefore === newPathCost) {
            optimalPaths.push(newPath);
          } else if (bestScoreSeenBefore === undefined || bestScoreSeenBefore > newPathCost) {
            optimalPaths = [newPath];
            bestScoreToLocation.set(key, newPathCost);
          }
          continue;
        } else {
          bestScoreToLocation.set(key, newPathCost);
        }

        pathsToTest.enqueue(newPath);
      }
    }
  }

  for (const path of optimalPaths) {
    for (const position of path) {
      g.setLetter(position, 'O');
    }
  }
  // console.log(g.toString());
  console.log(g.toString().match(/O/g)?.length);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
