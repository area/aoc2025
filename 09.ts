import { lineByLineGenerator } from './common/lineByLineGenerator';

const filePath = './inputs/09.txt';

class Block {
  position: number;
  fileId: number;

  constructor (position: number, fileId: number) {
    this.position = position;
    this.fileId = fileId;
  }
}

class Disk {
  blocks: Block[] = [];

  addBlock (b: Block): void {
    this.blocks.push(b);
  }

  sortBlocks (): void {
    this.blocks.sort((a, b) => a.position - b.position);
  }

  getLastBlock (): Block {
    return this.blocks[this.blocks.length - 1];
  }

  defrag (): void {
    const newBlocks = [];
    const nBlocks = this.blocks.length;
    let i = 0;
    let endPointer = this.blocks.length - 1;
    while (i < nBlocks && endPointer > i) {
      if (i >= this.blocks.length) {
        break;
      } else if (this.blocks[i].position > newBlocks.length) {
        // Fill gaps up to this position with blocks from the end
        while (this.blocks[i].position > newBlocks.length && endPointer > i) {
          newBlocks.push(new Block(newBlocks.length, this.blocks[endPointer].fileId));
          endPointer -= 1;
        }
        newBlocks.push(new Block(newBlocks.length, this.blocks[i].fileId));
      } else {
        newBlocks.push(new Block(newBlocks.length, this.blocks[i].fileId));
      }
      i += 1;
    }
    this.blocks = newBlocks;
  }

  defrag2 (): void {
    // console.log(this.toString());
    let fileId = this.blocks[this.blocks.length - 1].fileId;
    while (fileId >= 0) {
      const fileBlocks = this.blocks.filter(b => b.fileId === fileId);
      const fileStart = fileBlocks[0].position;
      // Now search from the left for an empty length this size
      let searchHead = -1;
      let emptyLength = 0;
      while (emptyLength < fileBlocks.length && searchHead < fileStart && searchHead < this.blocks.length - 2) {
        searchHead += 1;
        emptyLength = this.blocks[searchHead + 1].position - this.blocks[searchHead].position - 1;
      }

      if (this.blocks[searchHead].position < fileStart) {
        // Found a place to put our file
        fileBlocks.forEach(b => {
          b.position = b.position - fileStart + this.blocks[searchHead].position + 1;
        });
        this.sortBlocks();
      }
      fileId -= 1;
    }
  }

  toString (): string {
    const lastPosition = this.blocks.sort((a, b) => a.position - b.position)[this.blocks.length - 1].position;
    let s = '.'.repeat(lastPosition + 1);

    for (const b of this.blocks) {
      s = s.substr(0, b.position) + b.fileId + s.substr(b.position + 1);
    }
    return s;
  }

  checksum (): number {
    let total = 0;
    for (const b of this.blocks) {
      total += b.position * b.fileId;
    }
    return total;
  }
}

async function loadDisk (): Promise<Disk> {
  const d = new Disk();
  for await (const line of lineByLineGenerator(filePath)) {
    let file = true;
    let header = 0;
    let fileId = 0;
    for (const c of line.split('')) {
      if (file) {
        for (let i = 0; i < parseInt(c); i++) {
          d.addBlock(new Block(header, fileId));
          header += 1;
        }
        fileId += 1;
      } else {
        header += parseInt(c);
      }
      file = !file;
    }
  }
  return d;
}

async function part1 (): Promise<void> {
  // console.log(d.toString());
  const d = await loadDisk();
  d.defrag();
  // console.log(d.toString());
  console.log(d.checksum());
}

async function part2 (): Promise<void> {
  const d = await loadDisk();
  d.defrag2();
  // console.log(d.toString());
  console.log(d.checksum());
}

async function main (): Promise<void> {
  await part1();
  await part2();
}

void main();
