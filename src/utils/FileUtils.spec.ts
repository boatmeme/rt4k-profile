import { readFileBinary, readFileBinarySync, writeFileBinary, writeFileBinarySync } from './FileUtils';
import { readFile, writeFile } from 'fs/promises';
import { ProfileNotFoundError } from '../exceptions/RetroTinkProfileException';
import { readFileSync, writeFileSync } from 'fs';

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe('FileUtils', () => {
  const filePath = 'some/file/path';
  const someBytes = new Uint8Array([1, 2, 3]);
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('readFileBinary', () => {
    it('should call fs.promises.readFile', async () => {
      (readFile as jest.Mock).mockImplementation(() => true);
      await readFileBinary(filePath);
      expect(readFile).toHaveBeenCalledWith(filePath);
    });
    it('should rethrow the error if an error other than ENOENT occurs', async () => {
      const error = new Error('Some other error');
      (readFile as jest.Mock).mockRejectedValue(error);

      await expect(readFileBinary(filePath)).rejects.toThrow(error);
    });

    it('should throw ProfileNotFoundError if ENOENT error occurs', async () => {
      const enoentError = new Error('File not found') as NodeJS.ErrnoException;
      enoentError.code = 'ENOENT';
      (readFile as jest.Mock).mockRejectedValue(enoentError);

      await expect(readFileBinary(filePath)).rejects.toThrow(ProfileNotFoundError);
    });
  });
  describe('readFileBinarySync', () => {
    it('should call fs.promises.readFileSync', async () => {
      (readFile as jest.Mock).mockImplementation(() => true);
      readFileBinarySync(filePath);
      expect(readFileSync).toHaveBeenCalledWith(filePath);
    });
    it('should rethrow the error if an error other than ENOENT occurs', () => {
      const error = new Error('Some other error');
      (readFileSync as jest.Mock).mockImplementation(() => {
        throw error;
      });

      expect(() => readFileBinarySync('some/file/path')).toThrow(error);
    });

    it('should throw ProfileNotFoundError if ENOENT error occurs', () => {
      const enoentError = new Error('File not found') as NodeJS.ErrnoException;
      enoentError.code = 'ENOENT';
      (readFileSync as jest.Mock).mockImplementation(() => {
        throw enoentError;
      });

      expect(() => readFileBinarySync(filePath)).toThrow(ProfileNotFoundError);
    });
  });
  describe('writeFileBinary', () => {
    it('should call fs.promises.writeFile', async () => {
      (writeFile as jest.Mock).mockImplementation(() => true);
      await writeFileBinary(filePath, someBytes);
      expect(writeFile).toHaveBeenCalledWith(filePath, someBytes);
    });
    it('should rethrow the error if an error other than ENOENT occurs', async () => {
      const error = new Error('Some other error');
      (writeFile as jest.Mock).mockRejectedValue(error);

      await expect(writeFileBinary(filePath, someBytes)).rejects.toThrow(error);
    });

    it('should throw ProfileNotFoundError if ENOENT error occurs', async () => {
      const enoentError = new Error('File not found') as NodeJS.ErrnoException;
      enoentError.code = 'ENOENT';
      (writeFile as jest.Mock).mockRejectedValue(enoentError);

      await expect(writeFileBinary(filePath, someBytes)).rejects.toThrow(ProfileNotFoundError);
    });
  });
  describe('writeFileBinarySync', () => {
    it('should call fs.writeFileSync', async () => {
      (writeFileSync as jest.Mock).mockImplementation(() => true);
      writeFileBinarySync(filePath, someBytes);
      expect(writeFileSync).toHaveBeenCalledWith(filePath, someBytes);
    });
    it('should rethrow the error if an error other than ENOENT occurs', () => {
      const error = new Error('Some other error');
      (writeFileSync as jest.Mock).mockImplementation(() => {
        throw error;
      });

      expect(() => writeFileBinarySync(filePath, someBytes)).toThrow(error);
    });

    it('should throw ProfileNotFoundError if ENOENT error occurs', () => {
      const enoentError = new Error('File not found') as NodeJS.ErrnoException;
      enoentError.code = 'ENOENT';
      (writeFileSync as jest.Mock).mockImplementation(() => {
        throw enoentError;
      });

      expect(() => writeFileBinarySync(filePath, someBytes)).toThrow(ProfileNotFoundError);
    });
  });
});
