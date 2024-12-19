import { lineByLineGenerator } from './common/lineByLineGenerator';

const filePath = './inputs/19.txt';
const nSolutionsCache = new Map<string, number>();
const solutionsCache = new Map<string, string[][]>();
let towels: string[] = [];

function getNSolutions (target: string): number {
  if (nSolutionsCache.has(target)) {
    return nSolutionsCache.get(target) as number;
  }

  const longestTowel = Math.max(...towels.map(t => t.length));
  if (target.length <= longestTowel) {
    const solutions = solve(target);
    nSolutionsCache.set(target, solutions.length);
    return solutions.length;
  }

  let totalSolutions = 0;
  for (const t of towels) {
    if (target.startsWith(t)) {
      if (target === t) {
        totalSolutions += 1;
      } else {
        totalSolutions += getNSolutions(target.slice(t.length));
      }
    }
  }
  nSolutionsCache.set(target, totalSolutions);
  return totalSolutions;
}

function solve (target: string): string[][] {
  if (solutionsCache.has(target)) {
    return solutionsCache.get(target) as string[][];
  }

  const longestTowel = Math.max(...towels.map(t => t.length));
  const solutions: string[][] = [];

  for (let i = 1; i <= longestTowel; i++) {
    if (i > target.length) break;
    const prefix = target.slice(0, i);
    if (towels.includes(prefix)) {
      if (prefix === target) {
        solutions.push([prefix]);
      } else {
        const subSolutions = solve(target.slice(i));
        subSolutions.forEach(s => solutions.push([prefix, ...s]));
      }
    }
  }

  solutionsCache.set(target, solutions);
  return solutions;
}

async function loadTowelsAndTargets (filePath: string): Promise<{ targets: string[] }> {
  towels = [];
  const targets: string[] = [];
  for await (const line of lineByLineGenerator(filePath)) {
    if (line === '') continue;
    if (line.includes(',')) {
      towels.push(...line.split(', '));
    } else {
      targets.push(line);
    }
  }
  return { targets };
}

async function part1 (): Promise<void> {
  const { targets } = await loadTowelsAndTargets(filePath);
  let possible = 0;
  for (const target of targets) {
    if (getNSolutions(target) > 0) {
      possible += 1;
    }
  }
  console.log(possible);
}

async function part2 (): Promise<void> {
  const { targets } = await loadTowelsAndTargets(filePath);
  let overallSolutions = 0;
  for (const target of targets) {
    overallSolutions += getNSolutions(target);
  }
  console.log(overallSolutions);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
