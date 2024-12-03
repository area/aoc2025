import { lineByLineGenerator } from './common/lineByLineGenerator';

const filePath = './inputs/03.txt';

async function part1 (): Promise<void> {
  // Read contents of file line by line
  const lineByLine = lineByLineGenerator(filePath);
  let total = 0;
  for await (const line of lineByLine) {
    const regex = /mul\((\d+),(\d+)\)/g;
    const matches = line.matchAll(regex);
    if (matches === null) {
      continue;
    }
    for (const match of matches) {
      total += Number(match[1]) * Number(match[2]);
    }
  }
  console.log(total);
}

async function part2 (): Promise<void> {
  // Read contents of file line by line
  const lineByLine = lineByLineGenerator(filePath);
  let total = 0;
  let mulEnabled = true;
  for await (const line of lineByLine) {
    const mulRegex = /mul\((\d+),(\d+)\)/g;
    const muls = line.matchAll(mulRegex);
    const doRegex = /do\(\)/g;
    const dos = line.matchAll(doRegex);
    const dontRegex = /don't\(\)/g;
    const donts = line.matchAll(dontRegex);
    const matches = [...muls, ...dos, ...donts].sort((a, b) => a.index - b.index);

    for (const match of matches) {
      if (match[0] === 'do()') {
        mulEnabled = true;
      } else if (match[0] === 'don\'t()') {
        mulEnabled = false;
      } else if (mulEnabled) {
        total += Number(match[1]) * Number(match[2]);
      }
    }
  }
  console.log(total);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
