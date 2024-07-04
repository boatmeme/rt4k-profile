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

export class CRC16CCITT {
  private static readonly CRC_TABLE: readonly number[] = [
    0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad,
    0xe1ce, 0xf1ef,
  ];

  public static calculate(data: Uint8Array, startIndex: number = 0): number {
    return data.slice(startIndex).reduce(CRC16CCITT.updateCrc, 0) & 0xffff;
  }

  private static updateCrc(crc: number, byte: number): number {
    const updateStep = (c: number, b: number) => CRC16CCITT.CRC_TABLE[((c >> 12) ^ b) & 0x0f] ^ (c << 4);

    return updateStep(updateStep(crc, byte >> 4), byte);
  }
}
