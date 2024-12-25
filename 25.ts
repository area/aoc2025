import { lineByLineGenerator } from './common/lineByLineGenerator';
const filePath = './inputs/25.txt';

function getRepresentation (block: string[]): number[] {
  const representation: number[] = new Array<number>(block[0].length).fill(-1);

  for (let i = 0; i < block.length; i++) {
    for (let j = 0; j < block[i].length; j++) {
      if (block[i][j] === '#') {
        representation[j] += 1;
      }
    }
  }

  return representation;
}

enum BlockType {
  Key,
  Lock,
}

function isBlockKeyOrLock (block: string[]): BlockType {
  if (block[0] === '#'.repeat(block[0].length)) {
    return BlockType.Lock;
    // Then it's a lock
  } else {
    // Then it's a key
    return BlockType.Key;
  }
}

async function part1 (): Promise<void> {
  let block = [];
  const blocks = [];
  const keys: number[][] = [];
  const locks: number[][] = [];

  for await (const line of lineByLineGenerator(filePath)) {
    if (line !== '') {
      block.push(line);
    } else {
      blocks.push(block);
      // console.log(block);
      block = [];
    }
  }
  blocks.push(block);

  blocks.forEach((block) => {
    if (isBlockKeyOrLock(block) === BlockType.Key) {
      keys.push(getRepresentation(block));
    } else {
      locks.push(getRepresentation(block));
    }
  });

  let matchCount = 0;

  for (let i = 0; i < keys.length; i++) {
    for (let j = 0; j < locks.length; j++) {
      // console.log(keys[i], locks[j]);
      const sums = keys[i].map((key, index) => key + locks[j][index]);
      // console.log(sums)
      // console.log(sums);
      if (sums.every((sum) => sum < 6)) {
        matchCount += 1;
      }
    }
  }
  console.log(matchCount);
}

async function part2 (): Promise<void> {
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
