import { lineByLineGenerator } from './common/lineByLineGenerator';

class Device {
  wires = new Map<string, Wire>();
  gates: Gate[] = [];

  addWireIfNotExists (name: string): void {
    if (!this.wires.has(name)) {
      this.wires.set(name, new Wire(name, undefined));
    }
  }

  wireIsInputTo (wire: Wire): Gate[] {
    return this.gates.filter(g => g.inputs.includes(wire));
  }

  wireIsOutputFrom (wire: Wire): Gate | undefined {
    return this.gates.find(g => g.output === wire);
  }

  stateSummary (): string {
    return Array.from(this.wires.values()).map(w => `${w.signal ?? '.'}`).join('');
  }

  output (): number {
    return parseInt(Array.from(this.wires.values()).filter(w => w.name.startsWith('z')).sort((a, b) => b.name.localeCompare(a.name)).map(w => w.signal).join(''), 2);
  }

  evolve (): void {
    for (const gate of this.gates) {
      const [i1, i2] = gate.inputs;
      if (i1.signal === undefined || i2?.signal === undefined) {
        continue;
      }
      let outputSignal: number;
      switch (gate.type) {
        case 'XOR':
          outputSignal = i1.signal ^ i2.signal;
          break;
        case 'AND':
          outputSignal = i1.signal & i2.signal;
          break;
        case 'OR':
          outputSignal = i1.signal | i2.signal;
          break;
        case 'YES':
          outputSignal = i1.signal;
          break;
      }
      gate.output.signal = outputSignal;
    }
  }

  evolveToFinalState (): void {
    let oldSummary = '';
    // console.log(this.stateSummary());
    while (oldSummary !== this.stateSummary()) {
      oldSummary = this.stateSummary();
      this.evolve();
      // console.log(this.stateSummary());
    }
  }
}

type GateType = 'XOR' | 'AND' | 'OR' | 'YES';
function isGateType (type: string): type is GateType {
  return ['XOR', 'AND', 'OR'].includes(type);
}

class Wire {
  name: string;
  signal: number | undefined;

  constructor (name: string, signal: number | undefined) {
    this.name = name;
    this.signal = signal;
  }
}

class Gate {
  inputs: Wire[];
  output: Wire;
  type: GateType;

  constructor (inputs: Wire[], type: GateType, output: Wire) {
    this.inputs = inputs;
    this.output = output;
    this.type = type;
  }
}

const filePath = './inputs/24.txt';

async function setupDevice (filePath: string): Promise<Device> {
  const device = new Device();

  for await (const line of lineByLineGenerator(filePath)) {
    if (line === '') continue;
    if (line.includes(':')) {
      const [name, signal] = line.split(': ');
      const w = new Wire(name, parseInt(signal));
      device.wires.set(name, w);
    } else {
      const [i1Name, type, i2Name, , oName] = line.split(' ');

      device.addWireIfNotExists(i1Name);
      device.addWireIfNotExists(i2Name);
      device.addWireIfNotExists(oName);

      const i1 = device.wires.get(i1Name);
      const i2 = device.wires.get(i2Name);
      const out = device.wires.get(oName);

      if (i1 === undefined || i2 === undefined || out === undefined) {
        throw new Error('Wire not found');
      }

      if (!isGateType(type)) {
        throw new Error('Invalid gate type');
      }
      device.gates.push(new Gate([i1, i2], type, out));
    }
  }

  // Add a 'YES' gate for all output bits
  for (const wire of device.wires.values()) {
    if (wire.name.startsWith('z')) {
      device.gates.push(new Gate([wire], 'YES', wire));
    }
  }

  return device;
}

async function part1 (): Promise<void> {
  const device = await setupDevice(filePath);
  device.evolveToFinalState();
  console.log(device.output());
}

async function part2 (): Promise<void> {
  const device = await setupDevice(filePath);
  const switchedOutputs = new Set<string>();

  // Consider the half-adder at the start
  let xBit = device.wires.get('x00');
  let yBit = device.wires.get('y00');
  if (xBit === undefined || yBit === undefined) {
    throw new Error('Invalid initial state');
  }

  const xConnectsTo = device.wireIsInputTo(xBit);
  // const yConnectsTo = device.wireIsInputTo(yBit);

  // Each should connect to (the same) XOR and AND
  // The output from the xor is the value, the output from the AND is the carry
  let carryWire = xConnectsTo.filter(x => x.type === 'AND')[0].output;

  // Now it's full adders the rest of the way.
  let bit = 1;
  while (device.wires.has(`x${bit.toString().padStart(2, '0')}`)) {
    // console.log(bit);
    xBit = device.wires.get(`x${bit.toString().padStart(2, '0')}`);
    yBit = device.wires.get(`y${bit.toString().padStart(2, '0')}`);
    if (xBit === undefined || yBit === undefined) {
      throw new Error('Invalid state');
    }

    // xBit and yBit should connect to the same XOR and AND gates
    const xConnectsTo = device.wireIsInputTo(xBit);
    const yConnectsTo = device.wireIsInputTo(yBit);
    if (xConnectsTo.filter(x => x.type === 'XOR')[0].output !== yConnectsTo.filter(x => x.type === 'XOR')[0].output) {
      throw new Error('Bitwise inputs not connected to same XOR gate');
    }
    if (xConnectsTo.filter(x => x.type === 'AND')[0].output !== yConnectsTo.filter(x => x.type === 'AND')[0].output) {
      throw new Error('Bitwise inputs not connected to same AND gate');
    }

    const inputsXOR = xConnectsTo.filter(x => x.type === 'XOR')[0];
    const inputsAND = xConnectsTo.filter(x => x.type === 'AND')[0];

    // The XOR'd gate and the incoming carry should each go to the same XOR and AND gates

    const xorConnectsTo = device.wireIsInputTo(inputsXOR.output);
    const carryConnectsTo = device.wireIsInputTo(carryWire);

    const inputsXORXOR = xorConnectsTo.filter(x => x.type === 'XOR')[0];
    const inputsXORAND = xorConnectsTo.filter(x => x.type === 'AND')[0];
    const carryXOR = carryConnectsTo.filter(x => x.type === 'XOR')[0];
    const carryAND = carryConnectsTo.filter(x => x.type === 'AND')[0];

    if (inputsXORXOR !== carryXOR) {
      // console.log('Carry and inputsXOR not connected to same XOR gate');
      // console.log('Are connected to');
      // console.log(inputsXORXOR, carryXOR);
      if (inputsXORXOR !== undefined && carryXOR !== undefined) {
        throw new Error('Carry and inputsXOR both connected to different XOR gates');
      }
      if (carryXOR === undefined) {
        // console.log('Carry is instead connected to');
        // console.log(carryConnectsTo);
        // console.log('by wire', carryWire.name);
        switchedOutputs.add(carryWire.name);
      } else {
        // console.log('inputsXOR is instead connected to');
        // console.log('by wire', inputsXOR.output.name);
        // console.log(xorConnectsTo)
        switchedOutputs.add(inputsXOR.output.name);
        // THE POOCHER IS THE BEST
      }
      // console.log(carryConnectsTo, xorConnectsTo)
    }
    const inputsXORXORCarry = inputsXORXOR ?? carryXOR;

    if (inputsXORAND !== carryAND) {
      // console.log('Carry and inputsXOR not connected to same AND gate');
      // console.log('Are connected to');
      // console.log(inputsXORAND, carryAND);
      if (inputsXORAND !== undefined && carryAND !== undefined) {
        throw new Error('Carry and inputsXOR both connected to different AND gates');
      }
      if (carryAND === undefined) {
        // console.log('Carry is instead connected to');
        // console.log(carryConnectsTo);
        // console.log('by wire', carryWire.name);
        switchedOutputs.add(carryWire.name);
      } else {
        // console.log('inputsXOR is instead connected to');
        // console.log('by wire', inputsXOR.output.name);
        // console.log('gate with inputs', xorConnectsTo[0].inputs)
        // console.log('when should have been connected to')
        // console.log(carryAND)
        switchedOutputs.add(inputsXOR.output.name);
      }
    }
    const inputsXORANDCarry = inputsXORAND ?? carryAND;

    // inputsXorXorCarry Should go to zXX, as it's the sum bit
    if (inputsXORXORCarry.output.name !== `z${bit.toString().padStart(2, '0')}`) {
      // console.log('Sum not connected to correct wire');
      // console.log(`Saw ${inputsXORXORCarry?.output.name} expected z${bit.toString().padStart(2, '0')}`);
      switchedOutputs.add(inputsXORXORCarry.output.name);
      switchedOutputs.add(`z${bit.toString().padStart(2, '0')}`);
    }

    const inputsXORANDCarryConnectsTo = device.wireIsInputTo(inputsXORANDCarry.output);
    const inputsANDConnectsTo: Gate[] = device.wireIsInputTo(inputsAND.output);

    const inputsXORANDCarryOR = inputsXORANDCarryConnectsTo.filter(x => x.type === 'OR')[0];
    const inputsANDOR = inputsANDConnectsTo.filter(x => x.type === 'OR')[0];

    if (inputsXORANDCarryOR !== inputsANDOR) {
      // console.log('InputsXORANDCarry and inputsAND not connected to same OR gate');
      // console.log('Are connected to');
      // console.log(inputsXORANDCarryOR, inputsANDOR);
      if (inputsXORANDCarryOR !== undefined && inputsANDOR !== undefined) {
        throw new Error('InputsXORANDCarry and inputsAND both connected to different OR gates');
      }

      if (inputsXORANDCarryOR === undefined) {
        // console.log('InputsXORANDCarry is instead connected to');
        // console.log(inputsXORANDCarryConnectsTo);
        // console.log('by wire', inputsXORANDCarry.output.name);
        switchedOutputs.add(inputsXORANDCarry.output.name);
      } else {
        // console.log('inputsAND is instead connected to');
        // console.log('by wire', inputsAND.output.name);
        // console.log('gate with inputs', inputsAND.inputs)
        // console.log('when should have been connected to')
        // console.log(inputsXORANDCarryOR)
        switchedOutputs.add(inputsAND.output.name);
      }
    }

    carryWire = inputsXORANDCarryOR?.output ?? inputsANDOR?.output;

    bit += 1;
  }

  console.log(Array.from(switchedOutputs.values()).sort((a, b) => a.localeCompare(b)).join(','));
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
