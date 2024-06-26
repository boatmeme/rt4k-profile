import { SettingTypeError, SettingValidationError } from '../exceptions/RetroTinkProfileException';
import {
  RetroTinkSetting,
  RetroTinkSettingValue,
  RetroTinkSettings,
  RetroTinkSettingsValues,
} from '../settings/RetroTinkSetting';
import { DataType } from './DataType';

describe('RetroTinkSetting', () => {
  describe('RetroTinkSettingsValues', () => {
    describe('constructor', () => {
      it('should initialize as empty Map', () => {
        const settings = new RetroTinkSettingsValues();
        expect(settings.size).toBe(0);
        expect(settings).toBeInstanceOf(Map);
      });
    });
    describe('asPlainObject', () => {
      it('should merge plain object values in complex, nested structures', () => {
        const settings = new RetroTinkSettingsValues();
        const v = new RetroTinkSettingValue(
          new RetroTinkSetting({
            name: 'some.retrotink.sibling_1',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.INT,
          }),
          new Uint8Array([4]),
        );
        settings.set(v.name, v);
        const v2 = new RetroTinkSettingValue(
          new RetroTinkSetting({
            name: 'some.retrotink.sibling_2',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x000d, length: 1 }],
            type: DataType.STR,
          }),
          new Uint8Array([6]),
        );
        settings.set(v2.name, v2);
        const v3 = new RetroTinkSettingValue(
          new RetroTinkSetting({
            name: 'some.uncle',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.ENUM,
            enums: [
              { name: 'Choice 1', value: new Uint8Array([1]) },
              { name: 'Choice 2', value: new Uint8Array([2]) },
              { name: 'Choice 3', value: new Uint8Array([3]) },
            ],
          }),
          new Uint8Array([2]),
        );
        settings.set(v3.name, v3);
        const o = settings.asPlainObject();
        console.log(o);
        expect(o).toEqual({
          some: {
            retrotink: {
              sibling_1: 4,
              sibling_2: '\x06',
            },
            uncle: 'Choice 2',
          },
        });
      });
    });
  });
  describe('RetroTinkSettings', () => {
    describe('constructor', () => {
      it('should initialize as empty Map', () => {
        const settings = new RetroTinkSettings();
        expect(settings.size).toBe(0);
        expect(settings).toBeInstanceOf(Map);
      });
    });
  });
  describe('RetroTinkSettingValue', () => {
    describe('compareUint8Array', () => {
      test('equals', () => {
        const comparison = RetroTinkSettingValue.compareUint8Array(new Uint8Array([1]), new Uint8Array([1]));
        expect(comparison).toBe(true);
      });
      test('not equal (same length)', () => {
        const comparison = RetroTinkSettingValue.compareUint8Array(new Uint8Array([1]), new Uint8Array([2]));
        expect(comparison).toBe(false);
      });
      test('not equal (different length)', () => {
        const comparison = RetroTinkSettingValue.compareUint8Array(new Uint8Array([1]), new Uint8Array([2, 3]));
        expect(comparison).toBe(false);
      });
    });
    describe('asPlainObject', () => {
      describe('DataType.STR', () => {
        const s = new RetroTinkSetting({
          name: 'some.retrotink.setting',
          desc: 'Any Setting',
          byteRanges: [{ address: 0x0000, length: 12 }],
          type: DataType.STR,
        });
        const v = new RetroTinkSettingValue(s);
        v.set('0123456789');
        const o = v.asPlainObject();
        expect(o).toEqual({
          some: {
            retrotink: {
              setting: '0123456789',
            },
          },
        });
      });
      describe('DataType.INT', () => {
        const s = new RetroTinkSetting({
          name: 'some.retrotink.setting',
          desc: 'Any Setting',
          byteRanges: [{ address: 0x0000, length: 1 }],
          type: DataType.INT,
        });
        const v = new RetroTinkSettingValue(s);
        v.set('0123');
        const o = v.asPlainObject();
        expect(o).toEqual({
          some: {
            retrotink: {
              setting: 123,
            },
          },
        });
      });
      describe('DataType.ENUM', () => {
        const s = new RetroTinkSetting({
          name: 'some.retrotink.setting',
          desc: 'Any Setting',
          byteRanges: [{ address: 0x0000, length: 1 }],
          type: DataType.ENUM,
          enums: [
            { name: 'Choice 1', value: new Uint8Array([1]) },
            { name: 'Choice 2', value: new Uint8Array([2]) },
            { name: 'Choice 3', value: new Uint8Array([3]) },
          ],
        });
        const v = new RetroTinkSettingValue(s);
        v.set(1);
        const o = v.asPlainObject();
        expect(o).toEqual({
          some: {
            retrotink: {
              setting: `Choice 2`,
            },
          },
        });
      });
      describe('DataType.BIT', () => {
        const s = new RetroTinkSetting({
          name: 'some.retrotink.setting',
          desc: 'Any Setting',
          byteRanges: [{ address: 0x0000, length: 1 }],
          type: DataType.BIT,
        });
        const v = new RetroTinkSettingValue(s);
        v.set(true);
        const o = v.asPlainObject();
        expect(o).toEqual({
          some: {
            retrotink: {
              setting: true,
            },
          },
        });
      });
    });
    describe('set', () => {
      describe('DataType.STR', () => {
        test('should set with string', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 12 }],
            type: DataType.STR,
          });
          const v = new RetroTinkSettingValue(s);
          v.set('0123456789');
          expect(v.value.length).toEqual(12);
          expect(v.value).toEqual(new Uint8Array([48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 0, 0]));
        });
        test('should set with number', () => {
          const s = new RetroTinkSetting({
            name: 'header',
            desc: 'File Header',
            byteRanges: [{ address: 0x0000, length: 12 }],
            type: DataType.STR,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(123456789);
          expect(v.value.length).toEqual(12);
          expect(v.value).toEqual(new Uint8Array([49, 50, 51, 52, 53, 54, 55, 56, 57, 0, 0, 0]));
        });

        test('should set with boolean', () => {
          const s = new RetroTinkSetting({
            name: 'header',
            desc: 'File Header',
            byteRanges: [{ address: 0x0000, length: 12 }],
            type: DataType.STR,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(true);
          expect(v.value.length).toEqual(12);
          expect(v.value).toEqual(new Uint8Array([116, 114, 117, 101, 0, 0, 0, 0, 0, 0, 0, 0]));
        });

        test('should return boolean from asBoolean()', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.STR,
          });
          const v = new RetroTinkSettingValue(s);
          v.set('');
          expect(v.asBoolean()).toBe(false);
          v.set('something');
          expect(v.asBoolean()).toBe(true);
        });

        test('should parse fromBoolean()', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 5 }],
            type: DataType.STR,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(true);
          expect(v.value).toEqual(new Uint8Array([116, 114, 117, 101, 0]));
          v.set(false);
          expect(v.value).toEqual(new Uint8Array([102, 97, 108, 115, 101]));
        });

        test('should throw with unexpected type', () => {
          const s = new RetroTinkSetting({
            name: 'header',
            desc: 'File Header',
            byteRanges: [{ address: 0x0000, length: 12 }],
            type: DataType.STR,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set([123456789] as unknown as string)).toThrow(SettingTypeError);
        });
      });
      describe('DataType.INT', () => {
        test('should set with string', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set('255');
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([255]));
        });
        test('should set with number', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(255);
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([255]));
        });

        test('should return boolean from asBoolean()', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(0);
          expect(v.asBoolean()).toBe(false);
          v.set(1);
          expect(v.asBoolean()).toBe(true);
        });
        test('should parse fromBoolean()', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(true);
          expect(v.value).toEqual(new Uint8Array([1]));
          v.set(false);
          expect(v.value).toEqual(new Uint8Array([0]));
        });

        test('should throw if type not implemented in asInt()', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 8 }],
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.asInt()).toThrow(SettingTypeError);
        });
        test('should throw if type not implemented in fromInt()', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 8 }],
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set(256)).toThrow(SettingTypeError);
        });
        test('should throw if out of range', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set(256)).toThrow(SettingValidationError);
        });
        test('should set with boolean', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(true);
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([1]));
        });
        test('should throw if not a number', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set('a255')).toThrow(SettingTypeError);
        });
        test('should throw with unexpected type', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set([123456789] as unknown as string)).toThrow(SettingTypeError);
        });
      });
      describe('DataType.SIGNED_INT', () => {
        test('should set with string', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.SIGNED_INT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set('-4');
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([252]));
        });
        test('should set with number', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.SIGNED_INT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(-4);
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([252]));
        });
        test('should parse fromBoolean()', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.SIGNED_INT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(true);
          expect(v.value).toEqual(new Uint8Array([1]));
          v.set(false);
          expect(v.value).toEqual(new Uint8Array([0]));
        });
        test('should throw if out of range', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.SIGNED_INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set(129)).toThrow(SettingValidationError);
        });
        test('should set with boolean', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.SIGNED_INT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(true);
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([1]));
        });
        test('should throw if not a number', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.SIGNED_INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set('a127')).toThrow(SettingTypeError);
        });
        test('should throw with unexpected type', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.SIGNED_INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set([123456789] as unknown as string)).toThrow(SettingTypeError);
        });
      });
      describe('DataType.BIT', () => {
        test('should set with string', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.BIT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set('true');
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([1]));
          v.set('false');
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([0]));
        });
        test('should throw with invalid string', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.BIT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set('bunko')).toThrow(SettingValidationError);
          s.byteRanges[0].length = 2;
          expect(() => v.set('true')).toThrow(SettingValidationError);
        });
        test('should set with number', () => {
          const s = new RetroTinkSetting({
            name: 'header',
            desc: 'File Header',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.BIT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(1);
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([1]));
        });
        test('should throw for number out of range', () => {
          const s = new RetroTinkSetting({
            name: 'header',
            desc: 'File Header',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.BIT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set(2)).toThrow(SettingValidationError);
        });
        test('should set with boolean', () => {
          const s = new RetroTinkSetting({
            name: 'header',
            desc: 'File Header',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.BIT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(true);
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([1]));
          v.set(false);
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([0]));
        });
        test('should return boolean from asBoolean()', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            byteRanges: [{ address: 0x0000, length: 1 }],
            type: DataType.BIT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(0);
          expect(v.asBoolean()).toBe(false);
          v.set(1);
          expect(v.asBoolean()).toBe(true);
        });
        test('should throw with unexpected type', () => {
          const s = new RetroTinkSetting({
            name: 'header',
            desc: 'File Header',
            byteRanges: [{ address: 0x0000, length: 12 }],
            type: DataType.BIT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set([123456789] as unknown as string)).toThrow(SettingTypeError);
        });
      });
      describe('DataType.ENUM', () => {
        const s = new RetroTinkSetting({
          name: 'some.retrotink.setting',
          desc: 'Some value from a set of predefined choices',
          byteRanges: [{ address: 0x0000, length: 1 }],
          type: DataType.ENUM,
          enums: [
            { name: 'Choice 1', value: new Uint8Array([1]) },
            { name: 'Choice 2', value: new Uint8Array([2]) },
            { name: 'Choice 3', value: new Uint8Array([3]) },
          ],
        });
        test('should set with string, case insensitive', () => {
          const v = new RetroTinkSettingValue(s);
          const choice = 'Choice 2';
          v.set(choice.toLowerCase());
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([2]));
          v.set(choice.toUpperCase());
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([2]));
        });
        test('should throw with an invalid string', () => {
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set('an invalid string')).toThrow(SettingValidationError);
        });

        test('should set with number', () => {
          const v = new RetroTinkSettingValue(s);
          v.set(2);
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([3]));
        });

        test('should set with bytes', () => {
          const v = new RetroTinkSettingValue(s, new Uint8Array([2]));
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([2]));
        });

        test('should throw with invalid number', () => {
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set(-1)).toThrow(SettingValidationError);
          expect(() => v.set(3)).toThrow(SettingValidationError);
        });

        test('should throw with unexpected type', () => {
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set([123456789] as unknown as boolean)).toThrow(SettingTypeError);
        });
        test('should throw with bad bytes', () => {
          expect(() => new RetroTinkSettingValue(s, new Uint8Array([4]))).toThrow(SettingValidationError);
        });
        test('should throw when constructing a DataType.ENUM with non-unique values', () => {
          expect(
            () =>
              new RetroTinkSetting({
                name: 'some.retrotink.setting',
                desc: 'Some value from a set of predefined choices',
                byteRanges: [{ address: 0x0000, length: 1 }],
                type: DataType.ENUM,
                enums: [
                  { name: 'Choice 1', value: new Uint8Array([1]) },
                  { name: 'Choice 2', value: new Uint8Array([2]) },
                  { name: 'Duplicate Value', value: new Uint8Array([2]) },
                ],
              }),
          ).toThrow(SettingTypeError);
        });
      });
      describe('DataType.DOES_NOT_EXIST', () => {
        test('should throw with unexpected type', () => {
          const s = new RetroTinkSetting({
            name: 'header',
            desc: 'File Header',
            byteRanges: [{ address: 0x0000, length: 12 }],
            type: 'DOES_NOT_EXIST' as DataType,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set('true')).toThrow(SettingTypeError);
          expect(() => v.set(1)).toThrow(SettingTypeError);
          expect(() => v.set(true)).toThrow(SettingTypeError);
        });
      });
    });
  });
});
