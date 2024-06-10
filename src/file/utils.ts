import { readFile } from 'fs/promises';

export async function readFileBinary(filePath) {
  const data = await readFile(filePath);
  return new Uint8Array(data);
}
