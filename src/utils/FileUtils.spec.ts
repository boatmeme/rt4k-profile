import { CRC16CCITT, readFileBinary, readFileBinarySync, writeFileBinary, writeFileBinarySync } from './FileUtils';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { ProfileNotFoundError } from '../exceptions/RetroTinkProfileException';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe('FileUtils', () => {
  const fileDir = 'some/file/path';
  const filePath = `${fileDir}/profile.rt4`;
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
    it('should call fs.promises.writeFile and fs.promises.mkdir (default)', async () => {
      await writeFileBinary(filePath, someBytes);
      expect(writeFile).toHaveBeenCalledWith(filePath, someBytes);
      expect(mkdir).toHaveBeenCalledWith(fileDir, { recursive: true });
    });
    it('should call fs.promises.writeFile, but not fs.promises.mkdir (optional)', async () => {
      await writeFileBinary(filePath, someBytes, { createDirectoryIfNotExist: false });
      expect(writeFile).toHaveBeenCalledWith(filePath, someBytes);
      expect(mkdir).not.toHaveBeenCalled();
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
    it('should call fs.writeFileSync and fs.mkdirSync (default)', async () => {
      writeFileBinarySync(filePath, someBytes);
      expect(writeFileSync).toHaveBeenCalledWith(filePath, someBytes);
      expect(mkdirSync).toHaveBeenCalledWith(fileDir, { recursive: true });
    });
    it('should call fs.writeFileSync, but not fs.mkdirSync (optional)', async () => {
      writeFileBinarySync(filePath, someBytes, { createDirectoryIfNotExist: false });
      expect(writeFileSync).toHaveBeenCalledWith(filePath, someBytes);
      expect(mkdirSync).not.toHaveBeenCalled();
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
  describe('CRC16CCITT', () => {
    it('should calculate the correct CRC for a known input', () => {
      const testData = Buffer.from('123456789');
      const expectedCRC = 0x31c3;
      expect(CRC16CCITT.calculate(testData)).toBe(expectedCRC);
    });

    it('should calculate CRC correctly with a start index', () => {
      const testData = Buffer.from('12345');
      const expectedCRC = 0x3352;
      expect(CRC16CCITT.calculate(testData, 2)).toBe(expectedCRC);
    });
  });
});
