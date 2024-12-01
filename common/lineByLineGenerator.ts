import * as fs from 'fs';
import * as readline from 'readline';

export async function * lineByLineGenerator (filePath: string): AsyncGenerator<string> {
  const readStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    yield line;
  }
}
