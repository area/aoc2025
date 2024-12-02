import { lineByLineGenerator } from './common/lineByLineGenerator';

const filePath = './inputs/02.example.txt';

function isLineSafe (values: number[]): boolean {
  const diffs = values.map((value, idx) => {
    if (idx === 0) {
      return 0;
    }
    const prev = Number(values[idx - 1]);
    const current = Number(value);
    return current - prev;
  });
  diffs.shift(); // Remove the first 0
  return (
    diffs.every((diff) => Math.sign(diff) === Math.sign(diffs[0])) && // All the same sign
    Math.max(...diffs.map(d => Math.abs(d))) <= 3 // biggest diff is at most 3
  );
}

function isLineSafeWithDampener (values: number[]): boolean {
  return values.some((value, idx) => {
    return isLineSafe([...values.slice(0, idx), ...values.slice(idx + 1)]);
  });
};

async function part1 (): Promise<void> {
  const lineByLine = lineByLineGenerator(filePath);
  let safeCount = 0;
  for await (const line of lineByLine) {
    const values = line.split(/\s+/).map(Number);

    if (isLineSafe(values)) {
      safeCount++;
    }
  }
  console.log(safeCount);
}

async function part2 (): Promise<void> {
  const lineByLine = lineByLineGenerator(filePath);
  let safeCount = 0;
  for await (const line of lineByLine) {
    const values = line.split(/\s+/).map(Number);

    if (isLineSafeWithDampener(values)) {
      safeCount++;
    }
  }
  console.log(safeCount);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
