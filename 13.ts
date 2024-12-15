import { lineByLineGenerator } from './common/lineByLineGenerator';
import { Position, Vector } from './common/positions';
import { mat } from 'js-mat/mat/Mat';

const filePath = './inputs/13.txt';

class Machine {
  public a: Vector;
  public b: Vector;
  public p: Position;

  constructor (a: Vector, b: Vector, p: Position) {
    this.a = a;
    this.b = b;
    this.p = p;
  }
}

function getPrizeCost (m: Machine): number {
  const costs = [];
  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
      if (m.a.x * i + m.b.x * j === m.p.x && m.a.y * i + m.b.y * j === m.p.y) {
        costs.push(i * 3 + j);
      }
    }
  }
  if (costs.length === 0) {
    return 0;
  }
  return Math.min(...costs);
}

function getPrizeCost2 (m: Machine): number {
  const problemMatrix = new mat.Matrix([
    [m.a.x, m.b.x],
    [m.a.y, m.b.y],
  ]);

  // Calculate the inverse of the matrix
  const inverse = new mat.Matrix([
    [problemMatrix.arr[1][1], -problemMatrix.arr[0][1]],
    [-problemMatrix.arr[1][0], problemMatrix.arr[0][0]],
  ]).multiply(1 / problemMatrix.det());

  const solution = inverse.multiply(new mat.Matrix([[m.p.x], [m.p.y]]));
  const epsilon = 0.0001;
  if (Math.abs(Math.round(solution.arr[0][0]) - solution.arr[0][0]) < epsilon &&
      Math.abs(Math.round(solution.arr[1][0]) - solution.arr[1][0]) < epsilon) {
    return Math.round(solution.arr[0][0]) * 3 + Math.round(solution.arr[1][0]);
  } else {
    return 0;
  }
}

async function readInput (filePath: string): Promise<Machine[]> {
  const machines: Machine[] = [];
  const generator = lineByLineGenerator(filePath);
  let a = (await generator.next()).value as string;
  let b = (await generator.next()).value as string;
  let p = (await generator.next()).value as string;
  await generator.next();
  while (a !== undefined) {
    const buttonA = a.match(/Button A: X\+(\d+), Y\+(\d+)/);
    const buttonB = b.match(/Button B: X\+(\d+), Y\+(\d+)/);
    const prize = p.match(/Prize: X=(\d+), Y=(\d+)/);

    if (buttonA === null || buttonB === null || prize === null) {
      throw new Error('Invalid input');
    }

    machines.push(new Machine(new Vector(parseInt(buttonA[1]), parseInt(buttonA[2])), new Vector(parseInt(buttonB[1]), parseInt(buttonB[2])), new Position(parseInt(prize[1]), parseInt(prize[2]))));

    a = (await generator.next()).value as string;
    b = (await generator.next()).value as string;
    p = (await generator.next()).value as string;
    await generator.next();
  }
  return machines;
}

async function part1 (): Promise<void> {
  const machines = await readInput(filePath);
  let totalCost = 0;
  for (const m of machines) {
    totalCost += getPrizeCost(m);
  }
  console.log(totalCost);
}

async function part2 (): Promise<void> {
  const machines = await readInput(filePath);
  // Make the correction to the input for part 2
  machines.forEach(m => {
    m.p.x += 10000000000000;
    m.p.y += 10000000000000;
  });
  let totalCost = 0;
  for (const m of machines) {
    totalCost += getPrizeCost2(m);
  }
  console.log(totalCost);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
