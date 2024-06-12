import { SettingTypeError, SettingValidationError } from '../exceptions/RetroTinkProfileException';
import { RetroTinkSetting, RetroTinkSettingValue } from '../settings/RetroTinkSetting';
import { DataType } from './DataType';

describe('RetroTinkSetting', () => {
  describe('RetroTinkSettingValue', () => {
    describe('set', () => {
      describe('DataType.STR', () => {
        test('should set with string', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            address: 0x0000,
            length: 12,
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
            address: 0x0000,
            length: 12,
            type: DataType.STR,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(123456789);
          expect(v.value.length).toEqual(12);
          expect(v.value).toEqual(new Uint8Array([49, 50, 51, 52, 53, 54, 55, 56, 57, 0, 0, 0]));
        });
        test('should throw with unexpected type', () => {
          const s = new RetroTinkSetting({
            name: 'header',
            desc: 'File Header',
            address: 0x0000,
            length: 12,
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
            address: 0x0000,
            length: 1,
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
            address: 0x0000,
            length: 1,
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(255);
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([255]));
        });
        test('should throw if out of range', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            address: 0x0000,
            length: 1,
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set(256)).toThrow(SettingValidationError);
        });
        test('should throw if not a number', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            address: 0x0000,
            length: 1,
            type: DataType.INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set('a255')).toThrow(SettingTypeError);
        });
        test('should throw with unexpected type', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            address: 0x0000,
            length: 1,
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
            address: 0x0000,
            length: 1,
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
            address: 0x0000,
            length: 1,
            type: DataType.SIGNED_INT,
          });
          const v = new RetroTinkSettingValue(s);
          v.set(-4);
          expect(v.value.length).toEqual(1);
          expect(v.value).toEqual(new Uint8Array([252]));
        });
        test('should throw if out of range', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            address: 0x0000,
            length: 1,
            type: DataType.SIGNED_INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set(129)).toThrow(SettingValidationError);
        });
        test('should throw if not a number', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            address: 0x0000,
            length: 1,
            type: DataType.SIGNED_INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set('a127')).toThrow(SettingTypeError);
        });
        test('should throw with unexpected type', () => {
          const s = new RetroTinkSetting({
            name: 'some.retrotink.setting',
            desc: 'Any Setting',
            address: 0x0000,
            length: 1,
            type: DataType.SIGNED_INT,
          });
          const v = new RetroTinkSettingValue(s);
          expect(() => v.set([123456789] as unknown as string)).toThrow(SettingTypeError);
        });
      });
    });
  });
});
