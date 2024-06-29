import { readFile, writeFile, mkdir } from 'fs/promises';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { ProfileNotFoundError } from '../exceptions/RetroTinkProfileException';
import path from 'path';

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

export interface WriteFileOptions {
  createDirectoryIfNotExist: boolean;
}

const DEFAULT_WRITE_OPTS = {
  createDirectoryIfNotExist: true,
};

export async function writeFileBinary(filePath: string, data: Uint8Array, opts = DEFAULT_WRITE_OPTS): Promise<void> {
  try {
    const { createDirectoryIfNotExist } = opts;
    if (createDirectoryIfNotExist) await ensureDirectory(filePath);
    await writeFile(filePath, data);
  } catch (err) {
    if (err.code === 'ENOENT') throw new ProfileNotFoundError(err);
    throw err;
  }
}

export function writeFileBinarySync(filePath: string, data: Uint8Array, opts = DEFAULT_WRITE_OPTS): void {
  try {
    const { createDirectoryIfNotExist } = opts;
    if (createDirectoryIfNotExist) ensureDirectorySync(filePath);
    writeFileSync(filePath, data);
  } catch (err) {
    if (err.code === 'ENOENT') throw new ProfileNotFoundError(err);
    throw err;
  }
}

async function ensureDirectory(filePath: string) {
  const dirPath = path.dirname(filePath);
  return mkdir(dirPath, { recursive: true });
}

function ensureDirectorySync(filePath: string) {
  const dirPath = path.dirname(filePath);
  return mkdirSync(dirPath, { recursive: true });
}
