import { readFile } from 'fs/promises';
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
