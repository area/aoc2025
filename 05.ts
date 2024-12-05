import { lineByLineGenerator } from './common/lineByLineGenerator';

const filePath = './inputs/05.txt';

type Rule = [number, number];
const rules: Rule[] = [];
const updates: number[][] = [];

async function parseFile (): Promise<void> {
  const lineByLine = lineByLineGenerator(filePath);
  let parsingRules = true;
  for await (const line of lineByLine) {
    if (line === '') {
      parsingRules = false;
      continue;
    }
    if (parsingRules) {
      const rule = line.split('|').map(Number) as Rule;
      rules.push(rule);
    } else {
      const update = line.split(',').map(Number);
      updates.push(update);
    }
  }
}

function followsRule (rule: Rule, update: number[]): boolean {
  if (!update.includes(rule[0]) || !update.includes(rule[1])) {
    return true;
  }
  if (update.indexOf(rule[0]) < update.indexOf(rule[1])) {
    return true;
  }
  return false;
}

function followsAllRules (rules: Rule[], update: number[]): boolean {
  for (const r of rules) {
    if (!followsRule(r, update)) {
      return false;
    }
  }
  return true;
}

function part1 (): void {
  const validUpdates: number[][] = [];

  for (const u of updates) {
    if (followsAllRules(rules, u)) {
      validUpdates.push(u);
    }
  }

  let middleTotal = 0;

  for (const u of validUpdates) {
    middleTotal += u[(u.length - 1) / 2];
  }

  console.log(middleTotal);
}

function part2 (): void {
  const invalidUpdates: number[][] = [];

  for (const u of updates) {
    for (const r of rules) {
      if (!followsRule(r, u)) {
        invalidUpdates.push(u);
        break;
      }
    }
  }

  for (const u of invalidUpdates) {
    while (!followsAllRules(rules, u)) {
      for (const r of rules) {
        if (!followsRule(r, u)) {
          // Swap the offending numbers
          const i1 = u.indexOf(r[0]);
          const i2 = u.indexOf(r[1]);
          u[i1] = r[1];
          u[i2] = r[0];
        }
      }
    }
  }
  let middleTotal = 0;

  for (const u of invalidUpdates) {
    middleTotal += u[(u.length - 1) / 2];
  }

  console.log(middleTotal);
}

async function main (): Promise<void> {
  await parseFile();

  part1();
  part2();
}

void main();
