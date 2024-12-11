import { lineByLineGenerator } from './common/lineByLineGenerator';

const filePath = './inputs/07.txt';

function add (a: number, b: number): number {
  return a + b;
}

function multiply (a: number, b: number): number {
  return a * b;
}

function concat (a: number, b: number): number {
  return parseInt(a.toString() + b.toString());
}

type Operator = (a: number, b: number) => number;
interface Working { value: number, remaining: number[] };

function reduceWorking (working: Working, operators: Operator[]): Working[] {
  const results: Working[] = [];
  for (const operator of operators) {
    results.push({ value: operator(working.value, working.remaining[0]), remaining: working.remaining.slice(1) });
  }
  return results;
}

function canBeTrue (answer: string, elements: string[], operators: Operator[]): boolean {
  const working: Working = { value: parseInt(elements[0]), remaining: elements.slice(1).map(e => parseInt(e)) };
  const stack: Working[] = [working];
  while (stack.length > 0) {
    const current = stack.pop() as Working; // Can never return undefined, because of the while loop
    if (current.remaining.length === 0) {
      if (current.value === parseInt(answer)) {
        return true;
      }
    } else {
      stack.push(...reduceWorking(current, operators));
    }
  }
  return false;
}

async function part1 (): Promise<void> {
  let count = 0;
  for await (const line of lineByLineGenerator(filePath)) {
    const [answer, rest] = line.split(': ');
    const elements = rest.split(' ');
    if (canBeTrue(answer, elements, [add, multiply])) {
      count += parseInt(answer);
    }
  }
  console.log(count);
}

async function part2 (): Promise<void> {
  let count = 0;
  for await (const line of lineByLineGenerator(filePath)) {
    const [answer, rest] = line.split(': ');
    const elements = rest.split(' ');
    if (canBeTrue(answer, elements, [add, multiply, concat])) {
      count += parseInt(answer);
    }
  }
  console.log(count);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
