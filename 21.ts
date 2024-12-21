import { lineByLineGenerator } from './common/lineByLineGenerator';
import { Position, Vector } from './common/positions';
import { Grid } from './common/grid';

const filePath = './inputs/21.txt';

const numericKeypadLookup = new Map<string, Position>();
const directionalKeypadLookup = new Map<string, Position>();

type SummarisedSequence = Map<string, number>;

function init (): void {
  const keypad = new Grid();
  keypad.setLetter(new Position(0, 0), '7');
  keypad.setLetter(new Position(1, 0), '8');
  keypad.setLetter(new Position(2, 0), '9');
  keypad.setLetter(new Position(0, 1), '4');
  keypad.setLetter(new Position(1, 1), '5');
  keypad.setLetter(new Position(2, 1), '6');
  keypad.setLetter(new Position(0, 2), '1');
  keypad.setLetter(new Position(1, 2), '2');
  keypad.setLetter(new Position(2, 2), '3');
  keypad.setLetter(new Position(1, 3), '0');
  keypad.setLetter(new Position(2, 3), 'A');

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      numericKeypadLookup.set(keypad.getLetter(new Position(i, j)), new Position(i, j));
    }
  }

  const directionalKeypad = new Grid();
  directionalKeypad.setLetter(new Position(1, 0), '^');
  directionalKeypad.setLetter(new Position(2, 0), 'A');
  directionalKeypad.setLetter(new Position(0, 1), '<');
  directionalKeypad.setLetter(new Position(1, 1), 'v');
  directionalKeypad.setLetter(new Position(2, 1), '>');

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      directionalKeypadLookup.set(directionalKeypad.getLetter(new Position(i, j)), new Position(i, j));
    }
  }
}

function orthogonalVectorToSequence (v: Vector): string {
  if (v.equals(new Vector(0, 0))) {
    return '';
  }
  if (v.x !== 0 && v.y !== 0) {
    throw new Error('Not orthogonal');
  }
  if (v.x !== 0) {
    const sequence = v.x > 0 ? '>' : '<';
    return sequence.repeat(Math.abs(v.x));
  }
  if (v.y !== 0) {
    const sequence = v.y > 0 ? 'v' : '^';
    return sequence.repeat(Math.abs(v.y));
  }
  throw new Error('Not orthogonal');
}

function vectorToSequences (v: Vector): string[] {
  return [
    orthogonalVectorToSequence(new Vector(v.x, 0)) + orthogonalVectorToSequence(new Vector(0, v.y)) + 'A',
    orthogonalVectorToSequence(new Vector(0, v.y)) + orthogonalVectorToSequence(new Vector(v.x, 0)) + 'A',
  ];
}

function charToVector (c: string): Vector {
  switch (c) {
    case 'v':
      return new Vector(0, 1);
    case '^':
      return new Vector(0, -1);
    case '<':
      return new Vector(-1, 0);
    case '>':
      return new Vector(1, 0);
    default:
      throw new Error('Invalid character');
  }
}

function passOverEmptySquare (start: Position, sequence: string, emptySquare: Position): boolean {
  sequence = sequence.replaceAll('A', '');
  let p = start;
  for (const c of sequence.split('')) {
    p = p.add(charToVector(c));
    if (p.equals(emptySquare)) {
      return true;
    }
  }
  return false;
}

const sequenceCache = new Map<string, string>();

function getBestSequenceForDirectionalKeypad (line: string): string {
  if (sequenceCache.has(line)) {
    return sequenceCache.get(line) as string;
  }
  // console.log('getBestSequenceForDirectionalKeypad', line);
  let p = new Position(2, 0);
  let sequence = '';
  for (const c of line.split('')) {
    // console.log'ccurrent sequence for line', line, sequence, 'current character', c);
    const destination = directionalKeypadLookup.get(c);
    if (destination === undefined) {
      throw new Error('Invalid character');
    }
    const vector = destination.sub(p);

    // if we only move in one direciton, only one solution
    if (vector.x === 0 || vector.y === 0) {
      sequence += orthogonalVectorToSequence(vector) + 'A';
    } else {
      // There are two possible solutions - do horizontal first, then vertical, or vice versa.
      // One of these could be invalid, passing over the empty square...
      const [s1, s2] = vectorToSequences(vector);
      // console.log('candidate sequences', s1, s2);
      if (passOverEmptySquare(p, s1, new Position(0, 0))) {
        sequence += s2;
      } else if (passOverEmptySquare(p, s2, new Position(0, 0))) {
        sequence += s1;
      } else if (s1.length <= 3) {
        if (s1[0] === '<') {
          sequence += s1;
        } else if (s2[0] === '<') {
          sequence += s2;
        } else if (s1[0] === '^' || s1[0] === 'v') {
          sequence += s1;
        } else {
          sequence += s2;
        }
      } else {
      // Here, they're both valid, and we need to choose the one that is best when expanded some
      // more
        const s1Next = getBestSequenceForDirectionalKeypad(s1);
        const s2Next = getBestSequenceForDirectionalKeypad(s2);
        if (s1Next.length === s2Next.length) {
          throw new Error('AAAAAAH');
        } else if (s1Next.length < s2Next.length) {
          sequence += s1;
        } else {
          sequence += s2;
        }
      }
    }
    p = destination;
  }
  sequenceCache.set(line, sequence);
  return sequence;
}

function getSequenceForNumericKeypad (line: string): string {
  let p = new Position(2, 3);
  let sequence = '';
  for (const c of line.split('')) {
    // console.log('current sequence', sequence);
    const destination = numericKeypadLookup.get(c);
    if (destination === undefined) {
      throw new Error('Invalid character');
    }
    const vector = destination.sub(p);
    // If we're only moving in one direction, just one solution
    if (vector.x === 0 || vector.y === 0) {
      sequence += orthogonalVectorToSequence(vector) + 'A';
    } else {
      // If we're moving in both directions, two possible solutions
      const [s1, s2] = vectorToSequences(vector);
      // One of these could be invalid, passing over the empty square
      if (passOverEmptySquare(p, s1, new Position(0, 3))) {
        sequence += s2;
      } else if (passOverEmptySquare(p, s2, new Position(0, 3))) {
        sequence += s1;
      } else {
        // console.log('Both valid');
        // console.log(s1, s2);
        // Here, they're both valid, and we need to choose the one that is best when expanded to
        // the next level
        let s1Next = getBestSequenceForDirectionalKeypad(s1);
        let s2Next = getBestSequenceForDirectionalKeypad(s2);
        while (s1Next.length === s2Next.length) {
          s1Next = getBestSequenceForDirectionalKeypad(s1Next);
          s2Next = getBestSequenceForDirectionalKeypad(s2Next);
        }
        if (s1Next.length === s2Next.length) {
          throw new Error('AAAAAAH');
        }
        if (s1Next.length < s2Next.length) {
          sequence += s1;
        } else {
          sequence += s2;
        }
      }
    }
    p = destination;
  }

  return sequence;
}

async function part1 (): Promise<void> {
  init();
  let totalComplexity = 0;
  for await (const line of lineByLineGenerator(filePath)) {
    totalComplexity += getComplexityPart2(line, 2);
  }

  console.log(totalComplexity);
}

function getBestSummarisedSequenceForDirectionalKeypad (summarisedSequence: SummarisedSequence): SummarisedSequence {
  const newSummarisedSequence = new Map<string, number>();
  for (const [k, v] of summarisedSequence) {
    const sequence = getBestSequenceForDirectionalKeypad(k);
    for (const c of sequence.split('A').map(s => s + 'A').slice(0, -1)) {
      newSummarisedSequence.set(c, (newSummarisedSequence.get(c) ?? 0) + v);
    }
  }
  return newSummarisedSequence;
}

function getSequenceLengthPart2 (line: string, loops: number): number {
  const sequence = getSequenceForNumericKeypad(line);
  let summarisedSequence = new Map<string, number>();
  for (const c of sequence.split('A').map(s => s + 'A').slice(0, -1)) {
    summarisedSequence.set(c, (summarisedSequence.get(c) ?? 0) + 1);
  }
  for (let i = 0; i < loops; i++) {
    summarisedSequence = getBestSummarisedSequenceForDirectionalKeypad(summarisedSequence);
  }
  let totalLength = 0;
  for (const [k, v] of summarisedSequence) {
    totalLength += k.length * v;
  }

  return totalLength;
}

function getComplexityPart2 (line: string, n: number): number {
  const sequenceLength = getSequenceLengthPart2(line, n);
  const complexity = parseInt(line.replaceAll('A', ''), 10) * sequenceLength;
  return complexity;
}

async function part2 (): Promise<void> {
  let totalComplexity = 0;
  for await (const line of lineByLineGenerator(filePath)) {
    totalComplexity += getComplexityPart2(line, 25);
  }
  // 348675369134078 too high
  console.log(totalComplexity);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
