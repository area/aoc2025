import { Grid } from './common/grid';
import { lineByLineGenerator } from './common/lineByLineGenerator';
import { Position } from './common/positions';

const filePath = './inputs/08.txt';

class Antenna {
  public position = new Position(0, 0);
  public frequency: string = '';

  constructor (position: Position, frequency: string) {
    this.position = position;
    this.frequency = frequency;
  }
}

class Antinode {
  public position = new Position(0, 0);
  public frequency = '';

  constructor (position: Position, frequency: string) {
    this.position = position;
    this.frequency = frequency;
  }
}

async function readData (): Promise<{ g: Grid, antennas: Antenna[] }> {
  const g = new Grid();
  let lineIndex = 0;
  const antennas = [];
  for await (const line of lineByLineGenerator(filePath)) {
    let charIndex = 0;
    for (const c of line.split('')) {
      if (c !== '.') {
        const antenna = new Antenna(new Position(charIndex, lineIndex), c);
        antennas.push(antenna);
      }
      g.setLetter(new Position(charIndex, lineIndex), c);
      charIndex++;
    }
    lineIndex++;
  }
  return { g, antennas };
}

async function part1 (): Promise<void> {
  const { g, antennas } = await readData();
  // Get all frequencies in the set of antennas
  const frequencies = new Set(antennas.map(a => a.frequency));

  const antinodes = [];

  // For each frequency, for each pair of antennas, find where the antinodes are
  for (const f of frequencies) {
    const subset = antennas.filter(a => a.frequency === f);
    for (let i = 0; i < subset.length; i++) {
      for (let j = i + 1; j < subset.length; j++) {
        const v = subset[j].position.sub(subset[i].position);
        antinodes.push(new Antinode(subset[i].position.sub(v), f));
        antinodes.push(new Antinode(subset[j].position.add(v), f));
      }
    }
  }

  for (const a of antinodes) {
    if (a.position.x < g.width && a.position.y < g.height) {
      g.setLetter(a.position, '#');
    }
  }
  console.log(g.toString().match(/#/g)?.length);
}

async function part2 (): Promise<void> {
  const { g, antennas } = await readData();
  // Get all frequencies in the set of antennas
  const frequencies = new Set(antennas.map(a => a.frequency));

  const antinodes = [];

  // For each frequency, for each pair of antennas, find where the antinodes are
  for (const f of frequencies) {
    const subset = antennas.filter(a => a.frequency === f);
    for (let i = 0; i < subset.length; i++) {
      for (let j = i + 1; j < subset.length; j++) {
        const v = subset[j].position.sub(subset[i].position);
        let p = new Position(subset[i].position.x, subset[i].position.y);
        while (p.x >= 0 && p.y >= 0 && p.x < g.width && p.y < g.height) {
          antinodes.push(new Antinode(p, f));
          p = p.sub(v);
        }
        p = new Position(subset[j].position.x, subset[j].position.y);
        while (p.x >= 0 && p.y >= 0 && p.x < g.width && p.y < g.height) {
          antinodes.push(new Antinode(p, f));
          p = p.add(v);
        }
      }
    }
  }

  for (const a of antinodes) {
    if (a.position.x < g.width && a.position.y < g.height) {
      g.setLetter(a.position, '#');
    }
  }
  console.log(g.toString().match(/#/g)?.length);
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
