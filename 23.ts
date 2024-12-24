import { lineByLineGenerator } from './common/lineByLineGenerator';

const filePath = './inputs/23.txt';

class Computer {
  name: string;
  connectedTo: Set<Computer> = new Set<Computer>();

  constructor (name: string) {
    this.name = name;
  }

  public connectTo (computer: Computer): void {
    this.connectedTo.add(computer);
  }
}

class Network {
  computers: Map<string, Computer> = new Map<string, Computer>();

  public addComputer (computer: Computer): void {
    this.computers.set(computer.name, computer);
  }

  public getComputer (name: string): Computer | undefined {
    return this.computers.get(name);
  }
}

async function setupNetwork (filePath: string): Promise<Network> {
  const network = new Network();
  for await (const line of lineByLineGenerator(filePath)) {
    const cn = line.split('-');
    cn.forEach(c => {
      if (network.getComputer(c) === undefined) {
        const nc = new Computer(c);
        network.addComputer(nc);
      }
    });
    const c1 = network.getComputer(cn[0]);
    const c2 = network.getComputer(cn[1]);
    if (c1 === undefined || c2 === undefined) {
      throw new Error('Computer not found');
    }
    c1.connectTo(c2);
    c2.connectTo(c1);
  }
  return network;
}

async function part1 (): Promise<void> {
  const network = await setupNetwork(filePath);

  const loop3s = new Set<string>();

  for (const c1 of network.computers.values()) {
    for (const [c2] of c1.connectedTo.entries()) {
      for (const [c3] of c2.connectedTo.entries()) {
        if (c3.connectedTo.has(c1)) {
          const key = [c1.name, c2.name, c3.name].sort().join('-');
          if (key[0] === 't' || key[3] === 't' || key[6] === 't') {
            loop3s.add(key);
          }
        }
      }
    }
  }

  console.log(loop3s.size);
}

function expands (soFar: Set<Computer>, candidate: Computer): boolean {
  for (const c of soFar) {
    if (!c.connectedTo.has(candidate)) {
      return false;
    }
  }
  return true;
}

async function part2 (): Promise<void> {
  const network = await setupNetwork(filePath);
  const loop3s = new Set<string>();

  for (const c1 of network.computers.values()) {
    for (const [c2] of c1.connectedTo.entries()) {
      for (const [c3] of c2.connectedTo.entries()) {
        if (c3.connectedTo.has(c1)) {
          const key = [c1.name, c2.name, c3.name].sort().join('-');
          loop3s.add(key);
        }
      }
    }
  }

  let biggestGroup = new Set<Computer>();

  for (const loop3 of loop3s) {
    const [c1, c2, c3] = loop3.split('-').map(c => network.getComputer(c));
    if (c1 === undefined || c2 === undefined || c3 === undefined) {
      throw new Error('Computer not found');
    }
    const connectedGroup = new Set<Computer>([c1, c2, c3]);
    for (const c of network.computers.values()) {
      if (expands(connectedGroup, c)) {
        connectedGroup.add(c);
      }
    }
    if (connectedGroup.size >= biggestGroup.size) {
      biggestGroup = connectedGroup;
    }
  }

  console.log([...biggestGroup].map(c => c.name).sort().join(','));
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
