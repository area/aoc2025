import { lineByLineGenerator } from './common/lineByLineGenerator';

const filePath = './inputs/01.txt';

async function parseInput (): Promise<[number[], number[]]> {
  const listOne = new Array<number>();
  const listTwo = new Array<number>();
  const lineByLine = lineByLineGenerator(filePath);
  for await (const line of lineByLine) {
    const [a, b] = line.split(/\s+/).map(Number);
    listOne.push(a);
    listTwo.push(b);
  }
  return [listOne, listTwo];
}

async function part1 (): Promise<void> {
  const [listOne, listTwo] = await parseInput();
  listOne.sort((a, b) => b - a);
  listTwo.sort((a, b) => b - a);
  let total = 0;
  listOne.forEach((a, idx) => {
    total += Math.abs(listTwo[idx] - a);
  });
  console.log(total);
}

async function part2 (): Promise<void> {
  const [listOne, listTwo] = await parseInput();
  let total = 0;
  listOne.forEach((a) => {
    listTwo.forEach((b) => {
      if (a === b) {
        total += a;
      }
    });
  });
  console.log(total);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
