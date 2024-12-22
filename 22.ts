import { lineByLineGenerator } from './common/lineByLineGenerator';

const filePath = './inputs/22.txt';

function mix (a: bigint, b: bigint): bigint {
  return a ^ b;
}

function prune (secret: bigint): bigint {
  return secret % 16777216n;
}

function evolve (secret: bigint): bigint {
  secret = mix(secret, secret * 64n);
  secret = prune(secret);
  secret = mix(secret, secret / 32n);
  secret = prune(secret);
  secret = mix(secret, secret * 2048n);
  secret = prune(secret);
  return secret;
}

function evolveNTimes (secret: bigint, n: number): bigint {
  for (let i = 0; i < n; i++) {
    secret = evolve(secret);
  }
  return secret;
}

async function part1 (): Promise<void> {
  let total = 0n;
  for await (const line of lineByLineGenerator(filePath)) {
    const secret = BigInt(parseInt(line, 10));
    total += evolveNTimes(secret, 2000);
  }
  console.log(total.toString());
}

function getNumbers (secret: bigint, n: number): bigint[] {
  const numbers = [secret];
  for (let i = 0; i < n; i++) {
    secret = evolve(secret);
    numbers.push(secret);
  }
  return numbers;
}

function getDiffs (numbers: bigint[]): bigint[] {
  const diffs = [];
  for (let i = 0; i < numbers.length - 1; i++) {
    diffs.push((numbers[i + 1] % 10n - numbers[i] % 10n));
  }
  return diffs;
}

async function part2 (): Promise<void> {
  const bananasPerSequence = new Map<string, bigint>();

  for await (const line of lineByLineGenerator(filePath)) {
    const sequenceSeenSeller = new Set<string>();
    const list = getNumbers(BigInt(parseInt(line, 10)), 2000);
    const diffs = getDiffs(list);
    for (const [i] of diffs.entries()) {
      if (i < 4) {
        continue;
      }
      const sequence = diffs.slice(i - 4, i).join('');
      if (sequenceSeenSeller.has(sequence)) {
        continue;
      } else {
        bananasPerSequence.set(sequence, (bananasPerSequence.get(sequence) ?? 0n) + (list[i] % 10n));
        sequenceSeenSeller.add(sequence);
      }
    }
  }
  // Get the key of the biggest value in bananasPerSequence
  const biggest = [...bananasPerSequence.entries()].reduce((a, e) => e[1] > a[1] ? e : a);
  console.log(biggest[1].toString());
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
