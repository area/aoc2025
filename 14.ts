import { lineByLineGenerator } from './common/lineByLineGenerator';
import { Position, Vector } from './common/positions';

const filePath = './inputs/14.txt';
class Robot {
  public position: Position;
  public velocity: Vector;

  constructor (position: Position, velocity: Vector) {
    this.position = position;
    this.velocity = velocity;
  }
}

class Region {
  public robots: Robot[] = [];
  height: number;
  width: number;

  constructor (width: number, height: number) {
    this.height = height;
    this.width = width;
  }

  moveRobot (r: Robot): void {
    r.position = r.position.add(r.velocity);
    r.position.x %= this.width;
    r.position.y %= this.height;
    while (r.position.x < 0) {
      r.position.x += this.width;
    }
    while (r.position.y < 0) {
      r.position.y += this.height;
    }
  }

  nRobotsAdjacentTo (r: Robot): number {
    return this.robots.filter(robot => Math.abs(robot.position.x - r.position.x) <= 1 && Math.abs(robot.position.y - r.position.y) <= 1).length;
  }

  robotQuadrant (r: Robot): number {
    if (r.position.x === (this.width - 1) / 2 || r.position.y === (this.height - 1) / 2) {
      return 0;
    }
    let quadrant = 1;
    if (r.position.x > this.width / 2) {
      quadrant += 1;
    }
    if (r.position.y > this.height / 2) {
      quadrant += 2;
    }
    return quadrant;
  }

  toString (): string {
    const grid = [];
    for (let i = 0; i < this.height; i++) {
      grid.push(new Array(this.width).fill('.'));
    }
    for (const robot of this.robots) {
      if (grid[robot.position.y][robot.position.x] === '.') {
        grid[robot.position.y][robot.position.x] = 1;
      } else {
        grid[robot.position.y][robot.position.x] += 1;
      }
    }
    return grid.map(row => row.join('')).join('\n');
  }
}

async function loadData (filePath: string, width: number, height: number): Promise<Region> {
  const region = new Region(width, height);
  for await (const line of lineByLineGenerator(filePath)) {
    const res = line.match(/p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/);
    if (res === null) {
      throw new Error('Invalid input');
    }
    region.robots.push(new Robot(new Position(parseInt(res[1]), parseInt(res[2])), new Vector(parseInt(res[3]), parseInt(res[4]))));
  }
  return region;
}

async function part1 (): Promise<void> {
  const r = await loadData(filePath, filePath === './inputs/14.txt' ? 101 : 11, filePath === './inputs/14.txt' ? 103 : 7);

  for (let i = 0; i < 100; i++) {
    for (const robot of r.robots) {
      r.moveRobot(robot);
    }
  }

  const robotQuadrants = r.robots.map(robot => r.robotQuadrant(robot));
  const counts = robotQuadrants.reduce((acc: Record<number, number>, val) => {
    acc[val] = (isNaN(acc[val]) ? 0 : acc[val]) + 1;
    return acc;
  }, {});
  console.log(Object.values(counts).slice(1).reduce((acc, val) => acc * val, 1));
}

async function part2 (): Promise<void> {
  const r = await loadData(filePath, filePath === './inputs/14.txt' ? 101 : 11, filePath === './inputs/14.txt' ? 103 : 7);

  for (let i = 1; i < 100000; i++) {
    for (const robot of r.robots) {
      r.moveRobot(robot);
    }
    const averageRobotsAdjacentToRobots = r.robots.map(robot => r.nRobotsAdjacentTo(robot)).reduce((acc, val) => acc + val, 0) / r.robots.length;
    if (averageRobotsAdjacentToRobots > 3) { // This is a magic constant that's entirely a heuristic.
      console.log(i);
      process.exit(0);
    }
  }
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
