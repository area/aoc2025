import { lineByLineGenerator } from './common/lineByLineGenerator';

const filePath = './inputs/11.txt';

function getUpdatedStone (s: number): number[] {
  if (s === 0) {
    return [1];
  }
  if (s.toString().length % 2 === 0) {
    const l = s.toString().length / 2;
    return [parseInt(s.toString().substring(0, l)), parseInt(s.toString().substring(l))];
  }
  return [s * 2024];
}

async function part1 (): Promise<void> {
  let stones: number[] = [];
  for await (const line of lineByLineGenerator(filePath)) {
    stones = line.split(' ').map(s => parseInt(s));
  }

  for (let i = 0; i < 25; i++) {
    const newStones = [];
    for (let j = 0; j < stones.length; j++) {
      newStones.push(...getUpdatedStone(stones[j]));
    }
    stones = newStones;
  }

  console.log(stones.length);
}

async function part2 (): Promise<void> {
  let stones: Record<number, number> = {};
  for await (const line of lineByLineGenerator(filePath)) {
    const s = line.split(' ').map(s => parseInt(s));
    for (let i = 0; i < s.length; i++) {
      if (stones[s[i]] === undefined) {
        stones[s[i]] = 0;
      }
      stones[s[i]] += 1;
    }
  }

  for (let i = 0; i < 75; i++) {
    const newStones: Record<number, number> = {};
    for (const k in stones) {
      const kn = parseInt(k);
      const res = getUpdatedStone(kn);
      for (const r of res) {
        if (newStones[r] === undefined) {
          newStones[r] = 0;
        }
        newStones[r] += stones[kn];
      }
    }
    stones = newStones;
  }
  let total = 0;
  for (const k in stones) {
    total += stones[k];
  }
  console.log(total);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
