import { lineByLineGenerator } from './common/lineByLineGenerator';

const filePath = './inputs/17.txt';

class Computer {
  a = 0n;
  b = 0n;
  c = 0n;
  instructionPointer = 0n;
  output = '';

  adv (comboOperand: bigint): void {
    const operandValue = this.comboValue(comboOperand);
    const numerator = this.a;
    const denominator = 2n ** operandValue;
    this.a = numerator / denominator;
    this.instructionPointer += 2n;
  }

  bxl (literalOperand: bigint): void {
    this.b = this.b ^ literalOperand;
    this.instructionPointer += 2n;
  }

  bst (comboOperand: bigint): void {
    const operandValue = this.comboValue(comboOperand);
    this.b = operandValue % 8n;
    this.instructionPointer += 2n;
  }

  jnz (literalOperand: bigint): void {
    if (this.a !== 0n) {
      this.instructionPointer = literalOperand;
    } else {
      this.instructionPointer += 2n;
    }
  }

  bxc (operand: bigint): void {
    this.b = this.b ^ this.c;
    this.instructionPointer += 2n;
  }

  out (comboOperand: bigint): void {
    const operandValue = this.comboValue(comboOperand);
    if (this.output !== '') {
      this.output += ',';
    }
    this.output += (operandValue % 8n);
    this.instructionPointer += 2n;
  }

  bdv (comboOperand: bigint): void {
    const operandValue = this.comboValue(comboOperand);
    const numerator = this.a;
    const denominator = 2n ** operandValue;
    this.b = numerator / denominator;
    this.instructionPointer += 2n;
  }

  cdv (comboOperand: bigint): void {
    const operandValue = this.comboValue(comboOperand);
    const numerator = this.a;
    const denominator = 2n ** operandValue;
    this.c = numerator / denominator;
    this.instructionPointer += 2n;
  }

  execute (program: bigint[]): void {
    while (this.instructionPointer < program.length) {
      const opcode = program[parseInt(this.instructionPointer.toString())];
      const operand = program[parseInt((this.instructionPointer + 1n).toString())];
      if (opcode === 0n) {
        this.adv(operand);
      } else if (opcode === 1n) {
        this.bxl(operand);
      } else if (opcode === 2n) {
        this.bst(operand);
      } else if (opcode === 3n) {
        this.jnz(operand);
      } else if (opcode === 4n) {
        this.bxc(operand);
      } else if (opcode === 5n) {
        this.out(operand);
      } else if (opcode === 6n) {
        this.bdv(operand);
      } else if (opcode === 7n) {
        this.cdv(operand);
      } else {
        throw new Error('Invalid opcode');
      }
    }
  }

  comboValue (operand: bigint): bigint {
    if (operand >= 0 && operand <= 3) {
      return operand;
    } else if (operand === 4n) {
      return this.a;
    } else if (operand === 5n) {
      return this.b;
    } else if (operand === 6n) {
      return this.c;
    } else {
      throw new Error('Invalid operand');
    }
  }

  setRegister (register: string, value: bigint): void {
    if (register === 'a' || register === 'b' || register === 'c') {
      this[register] = value;
    } else {
      throw new Error('Invalid register');
    }
  }
}

async function initializeComputer (filePath: string): Promise<{ computer: Computer, program: bigint[] }> {
  let program: bigint[] = [];
  const computer = new Computer();
  for await (const line of lineByLineGenerator(filePath)) {
    if (line === '') {
      continue;
    } else if (line.startsWith('Program: ')) {
      program = line.split(' ')[1].split(',').map(BigInt);
    } else if (line.startsWith('Register ')) {
      const [, register, value] = line.split(' ');
      computer.setRegister(register[0].toLocaleLowerCase(), BigInt(value));
    } else {
      throw new Error('Invalid input');
    }
  }
  return { computer, program };
}

async function part1 (): Promise<void> {
  const { computer, program } = await initializeComputer(filePath);
  computer.execute(program);
  console.log(computer.output);
}

async function part2 (): Promise<void> {
  const { program } = await initializeComputer(filePath);

  const reversedProgram = program.slice().reverse();
  let candidateInputs = new Set<bigint>([0n]);
  for (const o of reversedProgram) {
    const nextCandidateInputs = new Set<bigint>();
    for (const input of candidateInputs) {
      const bs = solve(input, BigInt(o));
      // Any of these solutions could be right...
      // If none are returned, this branch is invalid and isn't added at all
      // to the nextCandidateInputs
      bs.forEach(b => nextCandidateInputs.add((input << 3n) + b));
    }
    candidateInputs = nextCandidateInputs;
  }

  // Get the smallest candidate input
  const smallest = Array.from(candidateInputs).sort((a, b) => a < b ? -1 : 1)[0];
  console.log(smallest.toString());
}

function solve (aShifted: bigint, output: bigint): bigint[] {
  const solutions = [];
  for (let bs = 0n; bs <= 7n; bs++) {
    const a = (aShifted << 3n) + bs;
    let b = a % 8n;
    b = b ^ 7n;
    const c = a / (2n ** b);
    b = b ^ c;
    b = b ^ 7n;
    const out = b % 8n;
    if (out === output) {
      solutions.push(bs);
    }
  }

  return solutions;
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
