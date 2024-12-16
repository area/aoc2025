import { lineByLineGenerator } from './common/lineByLineGenerator';
import { Position, Vector } from './common/positions';
import { Grid } from './common/grid';
import { SetWithContentEquality } from './common/setWithContentEquality';

const filePath = './inputs/15.txt';

class Robot {
  public position: Position;

  constructor (position: Position) {
    this.position = position;
  }
}

function gpsScore (g: Grid): number {
  let total = 0;
  for (let i = 0; i < g.width; i++) {
    for (let j = 0; j < g.height; j++) {
      if (g.getLetter(new Position(i, j)) === 'O') {
        total += i + j * 100;
      }
    }
  }
  return total;
}

function largeBoxGpsScore (g: Grid): number {
  let total = 0;
  for (let i = 0; i < g.width; i++) {
    for (let j = 0; j < g.height; j++) {
      if (g.getLetter(new Position(i, j)) === '[') {
        total += i + j * 100;
      }
    }
  }
  return total;
}

function getVectorFromDirection (direction: string): Vector {
  const directionMap: Record<string, Vector> = {
    '^': new Vector(0, -1),
    v: new Vector(0, 1),
    '<': new Vector(-1, 0),
    '>': new Vector(1, 0),
  };

  const vector = directionMap[direction];
  if (vector === undefined) {
    throw new Error('Invalid direction');
  }
  return vector;
}

async function part1 (): Promise<void> {
  let directions: string[] = [];
  const g = new Grid();
  const robot = new Robot(new Position(0, 0));
  let rowIdx = 0;
  for await (const line of lineByLineGenerator(filePath)) {
    if (line.length === 0) {
      continue;
    }
    if (line.charAt(0) !== '#') {
      directions = [...directions, ...line.split('')];
    } else {
      const entries = line.split('');
      for (let i = 0; i < entries.length; i++) {
        if (entries[i] === '@') {
          robot.position = new Position(i, rowIdx);
          g.setLetter(new Position(i, rowIdx), '@');
        } else {
          g.setLetter(new Position(i, rowIdx), entries[i]);
        }
      }
    }
    rowIdx++;
  }
  for (let i = 0; i < directions.length; i++) {
    const vec = getVectorFromDirection(directions[i]);
    // Have the robot move in that direction, along with any boxes if possible.

    // The 'end' of multiple things that move will be the first square that is not a # or O
    let end = new Position(robot.position.x, robot.position.y);
    const locationsToMove = [end];
    while (g.getLetter(end) === 'O' || g.getLetter(end) === '@') {
      end = end.add(vec);
      locationsToMove.push(end);
    }
    if (g.getLetter(end) === '#') {
      // Pushing stuff in to a wall, so nothing to do
      continue;
    }
    // Otherwise, move everything one
    for (let j = locationsToMove.length - 2; j >= 0; j--) {
      g.setLetter(locationsToMove[j + 1], g.getLetter(locationsToMove[j]));
    }
    g.setLetter(locationsToMove[0], '.');
    robot.position = robot.position.add(vec);
  }
  console.log(gpsScore(g));
}

async function part2 (): Promise<void> {
  let directions: string[] = [];
  const g = new Grid();
  const robot = new Robot(new Position(0, 0));
  let rowIdx = 0;
  for await (const line of lineByLineGenerator(filePath)) {
    if (line.length === 0) {
      continue;
    }
    if (line.charAt(0) !== '#') {
      directions = [...directions, ...line.split('')];
    } else {
      const entries = line.split('');
      for (let i = 0; i < entries.length; i++) {
        if (entries[i] === '#') {
          g.setLetter(new Position(2 * i, rowIdx), '#');
          g.setLetter(new Position(2 * i + 1, rowIdx), '#');
        } else if (entries[i] === 'O') {
          g.setLetter(new Position(2 * i, rowIdx), '[');
          g.setLetter(new Position(2 * i + 1, rowIdx), ']');
        } else if (entries[i] === '.') {
          g.setLetter(new Position(2 * i, rowIdx), '.');
          g.setLetter(new Position(2 * i + 1, rowIdx), '.');
        } else if (entries[i] === '@') {
          robot.position = new Position(2 * i, rowIdx);
          g.setLetter(new Position(2 * i, rowIdx), '@');
          g.setLetter(new Position(2 * i + 1, rowIdx), '.');
        } else {
          throw new Error('Invalid character');
        }
      }
    }
    rowIdx++;
  }

  for (let i = 0; i < directions.length; i++) {
    const vec = getVectorFromDirection(directions[i]);
    const end = new Position(robot.position.x, robot.position.y);
    let locationsToMove = new SetWithContentEquality<Position>(t => t.toString());
    const locationsToCheck = [end];
    while (locationsToCheck.length > 0) {
      const current = locationsToCheck.pop();
      if (current === undefined) {
        throw new Error('Invalid current');
      }
      const next = current.add(vec);
      if (g.getLetter(next) === '.') {
        locationsToMove.add(current);
        continue;
      }
      if (g.getLetter(next) === '#') {
        locationsToMove = new SetWithContentEquality<Position>(t => t.toString());
        break;
      }

      if (vec.y === 0) {
        locationsToCheck.push(next);
        locationsToMove.add(current);
      } else {
        if (g.getLetter(next) === '[') {
          locationsToCheck.push(next);
          locationsToCheck.push(new Position(next.x + 1, next.y));
          locationsToMove.add(current);
        } else if (g.getLetter(next) === ']') {
          locationsToCheck.push(next);
          locationsToCheck.push(new Position(next.x - 1, next.y));
          locationsToMove.add(current);
        }
      }
    }
    if (locationsToMove.values().length === 0) {
      continue;
    }

    let orderedLocationsToMove: Position[] = [];
    if (vec.x === -1 && vec.y === 0) {
      orderedLocationsToMove = locationsToMove.values().sort((a, b) => a.x - b.x);
    } else if (vec.x === 1 && vec.y === 0) {
      orderedLocationsToMove = locationsToMove.values().sort((a, b) => b.x - a.x);
    } else if (vec.y === -1 && vec.x === 0) {
      orderedLocationsToMove = locationsToMove.values().sort((a, b) => a.y - b.y);
    } else if (vec.y === 1 && vec.x === 0) {
      orderedLocationsToMove = locationsToMove.values().sort((a, b) => b.y - a.y);
    } else {
      throw new Error('Invalid direction');
    }

    for (let j = 0; j < orderedLocationsToMove.length; j++) {
      g.setLetter(orderedLocationsToMove[j].add(vec), g.getLetter(orderedLocationsToMove[j]));
      g.setLetter(orderedLocationsToMove[j], '.');
    }
    g.setLetter(orderedLocationsToMove[orderedLocationsToMove.length - 1], '.');
    robot.position = robot.position.add(vec);
  }
  console.log(largeBoxGpsScore(g));
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
