import { lineByLineGenerator } from './common/lineByLineGenerator';
import { orthoganalDirections, Position } from './common/positions';
import { Grid } from './common/grid';
import { aStar } from './common/astar';

const filePath = './inputs/18.txt';

const GRID_SIZE = 71;
const N_BYTES = 1024;

async function setupGridAndBytes (filePath: string): Promise<{ bytes: Position[], g: Grid }> {
  const bytes: Position[] = [];
  const g = new Grid();

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      g.setLetter(new Position(i, j), '.');
    }
  }

  for await (const line of lineByLineGenerator(filePath)) {
    const [x, y] = line.split(',').map(Number);
    bytes.push(new Position(x, y));
  }

  return { bytes, g };
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
        if (g.getLetter(neighbor) === '.') {
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
  const { bytes, g } = await setupGridAndBytes(filePath);

  for (let i = 0; i < N_BYTES; i++) {
    g.setLetter(bytes[i], '#');
  }

  const path = findPath(g, new Position(0, 0), new Position(GRID_SIZE - 1, GRID_SIZE - 1));

  console.log(path.length - 1);
}

async function part2 (): Promise<void> {
  const { bytes, g } = await setupGridAndBytes(filePath);
  let path: Position[] = findPath(g, new Position(0, 0), new Position(GRID_SIZE - 1, GRID_SIZE - 1));
  let i = 0;
  while (path.length > 0) {
    g.setLetter(bytes[i], '#');

    // Is the location of the byte in the path?
    if (path.some(p => p.equals(bytes[i]))) {
      // Find a new path
      path = findPath(g, new Position(0, 0), new Position(GRID_SIZE - 1, GRID_SIZE - 1));
    }
    i++;
  };

  console.log(`${bytes[i-1].x},${bytes[i-1].y}`);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
