import { readFileBinary, readFileBinarySync } from '../utils/FileUtils';
import { DataType } from '../settings/DataType';
import {
  RetroTinkSetting,
  RetroTinkSettingValue,
  RetroTinkSettings,
  RetroTinkSettingsValues,
} from '../settings/RetroTinkSetting';
import {
  InvalidProfileFormatError,
  SettingDeserializationError,
  SettingNotSupportedError,
} from '../exceptions/RetroTinkProfileException';

type RetroTinkSettingsValuesPlainObject = {
  [key: string]: string | number | boolean | RetroTinkSettingsValuesPlainObject;
};

export default class RetroTinkProfile {
  private _bytes: Uint8Array;
  private static _settings: RetroTinkSettings = new RetroTinkSettings([
    new RetroTinkSetting({
      name: 'header',
      desc: 'File Header',
      byteRanges: [{ address: 0x0000, length: 12 }],
      type: DataType.STR,
    }),
    new RetroTinkSetting({
      name: 'advanced.effects.mask.enabled',
      desc: 'Advanced -> Processing -> Mask -> Enabled',
      byteRanges: [{ address: 0x008c, length: 1 }],
      type: DataType.BIT,
    }),
    new RetroTinkSetting({
      name: 'advanced.effects.mask.strength',
      desc: 'Advanced -> Processing -> Mask -> Strength',
      byteRanges: [{ address: 0x02a0, length: 1 }],
      type: DataType.SIGNED_INT,
    }),
    new RetroTinkSetting({
      name: 'advanced.effects.mask.path',
      desc: 'Advanced -> Processing -> Mask -> Path',
      byteRanges: [{ address: 0x0090, length: 256 }],
      type: DataType.STR,
    }),
    new RetroTinkSetting({
      name: 'input',
      desc: 'Input',
      byteRanges: [
        { address: 0x0368, length: 1 },
        { address: 0x5869, length: 1 },
      ],
      type: DataType.ENUM,
      enums: [
        { name: 'HDMI', value: new Uint8Array([5, 0]) },
        { name: 'Front|Composite', value: new Uint8Array([3, 3]) },
        { name: 'Front|S-Video', value: new Uint8Array([3, 4]) },
        { name: 'RCA|YPbPr', value: new Uint8Array([0, 7]) },
        { name: 'RCA|RGsB', value: new Uint8Array([0, 8]) },
        { name: 'RCA|CVBS on Green', value: new Uint8Array([0, 9]) },
        { name: 'SCART|RGBS (75 Ohm)', value: new Uint8Array([2, 12]) },
        { name: 'SCART|RGsB', value: new Uint8Array([2, 13]) },
        { name: 'SCART|YPbPr', value: new Uint8Array([2, 14]) },
        { name: 'SCART|CVBS on Pin 20', value: new Uint8Array([2, 15]) },
        { name: 'SCART|CVBS on Green', value: new Uint8Array([2, 16]) },
        { name: 'SCART|Y/C on Pin 20/Red', value: new Uint8Array([2, 17]) },
        { name: 'HD-15|RGBHV', value: new Uint8Array([1, 20]) },
        { name: 'HD-15|RGBS', value: new Uint8Array([1, 21]) },
        { name: 'HD-15|RGsB', value: new Uint8Array([1, 22]) },
        { name: 'HD-15|YPbPr', value: new Uint8Array([1, 23]) },
        { name: 'HD-15|CVBS on Hsync', value: new Uint8Array([1, 24]) },
        { name: 'HD-15|CVBS on Green', value: new Uint8Array([1, 25]) },
        { name: 'HD-15|Y/C on Green/Red', value: new Uint8Array([1, 26]) },
        { name: 'HD-15|Y/C on G/R (Enh.)', value: new Uint8Array([1, 27]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.resolution',
      desc: 'HDMI Output -> Resolution',
      byteRanges: [{ address: 0x36c, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: '4K60', value: new Uint8Array([0]) },
        { name: '4K50', value: new Uint8Array([1]) },
        { name: '1080p60', value: new Uint8Array([2]) },
        { name: '1080p50', value: new Uint8Array([3]) },
        { name: '1440p60', value: new Uint8Array([4]) },
        { name: '1440p50', value: new Uint8Array([5]) },
        { name: '1080p100', value: new Uint8Array([6]) },
        { name: '1440p100', value: new Uint8Array([7]) },
        { name: '1080p120', value: new Uint8Array([8]) },
        { name: '1440p120', value: new Uint8Array([9]) },
        { name: '480p60', value: new Uint8Array([13]) },
        { name: 'Custom 1', value: new Uint8Array([69]) },
        { name: 'Custom 2', value: new Uint8Array([70]) },
        { name: 'Custom 3', value: new Uint8Array([71]) },
        { name: 'Custom 4', value: new Uint8Array([72]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.transmitter.hdr',
      desc: 'HDMI Output -> Transmitter -> HDR',
      byteRanges: [{ address: 0x2d0, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Off', value: new Uint8Array([0]) },
        { name: 'HDR10 [8-bit]', value: new Uint8Array([1]) },
        { name: 'HLG [8-bit]', value: new Uint8Array([2]) },
      ],
    }),
  ]);

  private constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  static fromBytes(bytes: Uint8Array) {
    const header = this._settings.get('header');
    const headerValue = new RetroTinkSettingValue(header, RetroTinkProfile.sliceBytes(header, bytes)).asString();
    if (headerValue !== 'RT4K Profile') throw new InvalidProfileFormatError(`Header is invalid: ${headerValue}`);
    return new RetroTinkProfile(bytes);
  }

  static async build(filename: string = `${__dirname}/default.rt4`) {
    const bytes = await readFileBinary(filename);
    return RetroTinkProfile.fromBytes(bytes);
  }

  static buildSync(filename: string = `${__dirname}/default.rt4`) {
    const bytes = readFileBinarySync(filename);
    return RetroTinkProfile.fromBytes(bytes);
  }

  static sliceBytes(setting: RetroTinkSetting, bytes: Uint8Array): Uint8Array {
    return new Uint8Array(
      setting.byteRanges.reduce((acc, range) => {
        return [...acc, ...bytes.slice(range.address, range.address + range.length)];
      }, []),
    );
  }

  sliceBytes(setting: RetroTinkSetting): Uint8Array {
    return RetroTinkProfile.sliceBytes(setting, this._bytes);
  }

  getSettingsNames(): string[] {
    return Array.from(RetroTinkProfile._settings).map(([, s]) => s.name);
  }

  getValues(): RetroTinkSettingsValues {
    return new RetroTinkSettingsValues(
      Array.from(RetroTinkProfile._settings, ([, s]) => new RetroTinkSettingValue(s, this.sliceBytes(s))),
    );
  }

  static get(key: string): RetroTinkSetting {
    return RetroTinkProfile._settings.get(key);
  }

  getValue(key: string): RetroTinkSettingValue {
    const setting = RetroTinkProfile.get(key);
    return new RetroTinkSettingValue(setting, this.sliceBytes(setting));
  }

  setValues(settings: RetroTinkSettingsValues): void {
    const byte_array = Array.from(this._bytes);
    for (const setting of settings.values()) {
      let offset = 0;
      for (const byteRange of setting.byteRanges) {
        byte_array.splice(
          byteRange.address,
          byteRange.length,
          ...setting.value.slice(offset, offset + byteRange.length),
        );
        offset += byteRange.length;
      }
    }
    this._bytes = new Uint8Array(byte_array);
  }

  private _setValueWithInstance(setting: RetroTinkSettingValue): void {
    if (!RetroTinkProfile._settings.has(setting.name)) throw new SettingNotSupportedError(setting.name);
    const byte_array = Array.from(this._bytes);
    let offset = 0;
    for (const byteRange of setting.byteRanges) {
      byte_array.splice(byteRange.address, byteRange.length, ...setting.value.slice(offset, offset + byteRange.length));
      offset += byteRange.length;
    }
    this._bytes = new Uint8Array(byte_array);
  }

  private _setValueWithPrimitive(settingsKey: string, val: string | number | boolean): void {
    if (!RetroTinkProfile._settings.has(settingsKey)) throw new SettingNotSupportedError(settingsKey);
    const setting = this.getValue(settingsKey);
    setting.set(val);
    return this._setValueWithInstance(setting);
  }

  setValue(setting: RetroTinkSettingValue): void;
  setValue(a: string, b: string | number | boolean): void;
  setValue(a: unknown, b?: string | number | boolean): void {
    if (typeof a === 'string' && (typeof b === 'number' || typeof b === 'string' || typeof b === 'boolean')) {
      return this._setValueWithPrimitive(a, b);
    } else if (a instanceof RetroTinkSettingValue) {
      return this._setValueWithInstance(a);
    }
  }

  private asPlainObject(): unknown {
    const pojo: RetroTinkSettingsValuesPlainObject = {};

    const addValueToObject = (
      obj: RetroTinkSettingsValuesPlainObject,
      keys: string[],
      value: string | number | boolean,
    ) => {
      const key = keys[0];
      if (keys.length === 1) {
        obj[key] = value;
      } else {
        if (!obj[key]) {
          obj[key] = {};
        }
        addValueToObject(obj[key] as RetroTinkSettingsValuesPlainObject, keys.slice(1), value);
      }
    };

    Array.from(this.getValues()).forEach(([name, item]) => {
      const keys = name.split('.');
      let value: string | number | boolean;

      switch (item.type) {
        case DataType.STR:
          value = item.asString();
          break;
        case DataType.ENUM:
          value = item.asString();
          break;
        case DataType.BIT:
          value = item.asBoolean();
          break;
        default:
          value = item.asInt();
      }

      addValueToObject(pojo, keys, value);
    });

    return pojo;
  }

  serializeValues(pretty: boolean = false): string {
    return JSON.stringify(this.asPlainObject(), null, pretty ? 2 : 0);
  }

  deserializeValues(json: string): void {
    const addValueToSettings = (obj: unknown, parentKey: string = '') => {
      Object.keys(obj).forEach((key) => {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        const value = obj[key];
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          addValueToSettings(value, fullKey);
        } else {
          this.setValue(fullKey, value);
        }
      });
    };
    try {
      const parsedObject = JSON.parse(json);
      addValueToSettings(parsedObject);
    } catch (err) {
      throw new SettingDeserializationError(err);
    }
  }
}
