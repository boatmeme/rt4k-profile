import { readFileBinary, readFileBinarySync } from './FileUtils';
import { readFile } from 'fs/promises';
import { ProfileNotFoundError } from '../exceptions/RetroTinkProfileException';
import { readFileSync } from 'fs';

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

describe('FileUtils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('readFileBinary', () => {
    it('should rethrow the error if an error other than ENOENT occurs', async () => {
      const error = new Error('Some other error');
      (readFile as jest.Mock).mockRejectedValue(error);

      await expect(readFileBinary('some/file/path')).rejects.toThrow(error);
    });

    it('should throw ProfileNotFoundError if ENOENT error occurs', async () => {
      const enoentError = new Error('File not found') as NodeJS.ErrnoException;
      enoentError.code = 'ENOENT';
      (readFile as jest.Mock).mockRejectedValue(enoentError);

      await expect(readFileBinary('some/file/path')).rejects.toThrow(ProfileNotFoundError);
    });
  });
  describe('readFileBinarySync', () => {
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

      expect(() => readFileBinarySync('some/file/path')).toThrow(ProfileNotFoundError);
    });
  });
});
