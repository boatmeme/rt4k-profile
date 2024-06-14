import { readFileBinary, readFileBinarySync } from '../utils/FileUtils';
import { DataType } from '../settings/DataType';
import {
  RetroTinkSetting,
  RetroTinkSettingValue,
  RetroTinkSettings,
  RetroTinkSettingsValues,
} from '../settings/RetroTinkSetting';
import { InvalidProfileFormatError, SettingNotSupportedError } from '../exceptions/RetroTinkProfileException';

type RetroTinkSettingsValuesPlainObject = {
  [key: string]: string | number | boolean | RetroTinkSettingsValuesPlainObject;
};

export default class RetroTinkProfile {
  private _bytes: Uint8Array;
  private static _settings: RetroTinkSettings = new RetroTinkSettings([
    new RetroTinkSetting({
      name: 'header',
      desc: 'File Header',
      address: 0x0000,
      length: 12,
      type: DataType.STR,
    }),
    new RetroTinkSetting({
      name: 'advanced.effects.mask.enabled',
      desc: 'Advanced -> Processing -> Mask -> Enabled',
      address: 0x008c,
      length: 1,
      type: DataType.BIT,
    }),
    new RetroTinkSetting({
      name: 'advanced.effects.mask.strength',
      desc: 'Advanced -> Processing -> Mask -> Strength',
      address: 0x02a0,
      length: 1,
      type: DataType.SIGNED_INT,
    }),
    new RetroTinkSetting({
      name: 'advanced.effects.mask.path',
      desc: 'Advanced -> Processing -> Mask -> Path',
      address: 0x0090,
      length: 256,
      type: DataType.STR,
    }),
  ]);

  private constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  static fromBytes(bytes: Uint8Array) {
    const header = this._settings.get('header');
    const headerValue = new RetroTinkSettingValue(
      header,
      bytes.slice(header.address, header.address + header.length),
    ).asString();
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

  getSettingsNames(): string[] {
    return Array.from(RetroTinkProfile._settings).map(([, s]) => s.name);
  }

  getValues(): RetroTinkSettingsValues {
    return new RetroTinkSettingsValues(
      Array.from(
        RetroTinkProfile._settings,
        ([, s]) => new RetroTinkSettingValue(s, this._bytes.slice(s.address, s.address + s.length)),
      ),
    );
  }

  static get(key: string): RetroTinkSetting {
    return RetroTinkProfile._settings.get(key);
  }

  getValue(key: string): RetroTinkSettingValue {
    const setting = RetroTinkProfile.get(key);
    return new RetroTinkSettingValue(setting, this._bytes.slice(setting.address, setting.address + setting.length));
  }

  setValues(settings: RetroTinkSettingsValues): void {
    const byte_array = Array.from(this._bytes);
    for (const setting of settings.values()) {
      byte_array.splice(setting.address, setting.length, ...setting.value);
    }
    this._bytes = new Uint8Array(byte_array);
  }

  private _setValueWithInstance(setting: RetroTinkSettingValue): void {
    if (!RetroTinkProfile._settings.has(setting.name)) throw new SettingNotSupportedError(setting.name);
    const byte_array = Array.from(this._bytes);
    byte_array.splice(setting.address, setting.length, ...setting.value);
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

  asJson(pretty: boolean = false): string {
    return JSON.stringify(this.asPlainObject(), null, pretty ? 2 : 0);
  }
}
