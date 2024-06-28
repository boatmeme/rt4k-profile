import { readFile, writeFile } from 'fs/promises';
import { readFileSync, writeFileSync } from 'fs';
import { ProfileNotFoundError } from '../exceptions/RetroTinkProfileException';

export async function readFileBinary(filePath) {
  try {
    const data = await readFile(filePath);
    return new Uint8Array(data);
  } catch (err) {
    if (err.code === 'ENOENT') throw new ProfileNotFoundError(err);
    throw err;
  }
}

export function readFileBinarySync(filePath) {
  try {
    const data = readFileSync(filePath);
    return new Uint8Array(data);
  } catch (err) {
    if (err.code === 'ENOENT') throw new ProfileNotFoundError(err);
    throw err;
  }
}

export async function writeFileBinary(filePath: string, data: Uint8Array): Promise<void> {
  try {
    await writeFile(filePath, data);
  } catch (err) {
    if (err.code === 'ENOENT') throw new ProfileNotFoundError(err);
    throw err;
  }
}

export function writeFileBinarySync(filePath: string, data: Uint8Array): void {
  try {
    writeFileSync(filePath, data);
  } catch (err) {
    if (err.code === 'ENOENT') throw new ProfileNotFoundError(err);
    throw err;
  }
}
