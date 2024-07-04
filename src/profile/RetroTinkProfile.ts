import {
  CRC16CCITT,
  readFileBinary,
  readFileBinarySync,
  writeFileBinary,
  writeFileBinarySync,
  WriteFileOptions,
} from '../utils/FileUtils';
import {
  RetroTinkSetting,
  RetroTinkSettingValue,
  RetroTinkSettings,
  RetroTinkSettingsValues,
  RetroTinkSettingsValuesPlainObject,
} from '../settings/RetroTinkSetting';
import {
  InvalidProfileFormatError,
  SettingDeserializationError,
  SettingNotSupportedError,
} from '../exceptions/RetroTinkProfileException';
import { flattenObject } from '../utils/ObjectUtils';
import { RetroTinkSettingName, RetroTinkSettingPath, RetroTinkSettingsVersion } from '../settings/Schema';

type ProfileScope<T extends RetroTinkSettingPath> = T | RegExp | ((key: T) => boolean);

export default class RetroTinkProfile {
  private _bytes: Uint8Array;
  private static _settings: RetroTinkSettings = RetroTinkSettingsVersion['1.4.2'];

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

  static get<T extends RetroTinkSettingName>(key: T): RetroTinkSetting {
    return RetroTinkProfile._settings.get(key);
  }

  private sliceBytes(setting: RetroTinkSetting): Uint8Array {
    return RetroTinkProfile.sliceBytes(setting, this._bytes);
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

  private _setValueWithPrimitive<T extends RetroTinkSettingName>(settingsKey: T, val: string | number | boolean): void {
    if (!RetroTinkProfile._settings.has(settingsKey)) throw new SettingNotSupportedError(settingsKey);
    const setting = this.getValue(settingsKey);
    setting.set(val);
    return this._setValueWithInstance(setting);
  }

  private static mergeAllSettings(target: RetroTinkProfile, source: RetroTinkProfile): void {
    for (const [, value] of source.getValues()) {
      target.setValue(value);
    }
  }

  private static mergeSettingsValues(target: RetroTinkProfile, source: RetroTinkSettingsValues): void {
    for (const value of source.values()) {
      target.setValue(value);
    }
  }

  private static mergeSettingValue(target: RetroTinkProfile, source: RetroTinkSettingValue): void {
    target.setValue(source);
  }

  private static matchesAnyScope<T extends RetroTinkSettingPath>(key: T, scopes: ProfileScope<T>[]): boolean {
    return scopes.some((scope) => {
      if (typeof scope === 'string') return key.startsWith(scope);
      if (scope instanceof RegExp) return scope.test(key);
      if (typeof scope === 'function') return scope(key);
    });
  }

  getSettingsNames(): string[] {
    return Array.from(RetroTinkProfile._settings).map(([, s]) => s.name);
  }

  getValues(...scopes: ProfileScope<RetroTinkSettingPath>[]): RetroTinkSettingsValues {
    const filterScope = scopes.length == 0 ? [() => true] : scopes;
    return new RetroTinkSettingsValues(
      Array.from(RetroTinkProfile._settings, ([, s]) => new RetroTinkSettingValue(s, this.sliceBytes(s))).filter((s) =>
        RetroTinkProfile.matchesAnyScope(s.name, filterScope),
      ),
    );
  }

  getValue<T extends RetroTinkSettingName>(key: T): RetroTinkSettingValue {
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

  setValue(setting: RetroTinkSettingValue): void;
  setValue(obj: RetroTinkSettingsValuesPlainObject): void;
  setValue<T extends RetroTinkSettingName>(a: T, b: string | number | boolean): void;
  setValue(a: unknown, b?: string | number | boolean): void {
    if (typeof a === 'string' && (typeof b === 'number' || typeof b === 'string' || typeof b === 'boolean')) {
      return this._setValueWithPrimitive(a as RetroTinkSettingName, b);
    } else if (a instanceof RetroTinkSettingValue) {
      return this._setValueWithInstance(a);
    } else {
      for (const setting of flattenObject(a as RetroTinkSettingsValuesPlainObject)) {
        this.setValue(setting.name as RetroTinkSettingName, setting.value);
      }
    }
  }

  serializeValues(pretty: boolean = false): string {
    return JSON.stringify(this.getValues().asPlainObject(), null, pretty ? 2 : 0);
  }

  deserializeValues(json: string): void {
    try {
      const parsedObject = JSON.parse(json);
      for (const setting of flattenObject(parsedObject)) {
        this.setValue(setting.name as RetroTinkSettingName, setting.value);
      }
    } catch (err) {
      throw new SettingDeserializationError(err);
    }
  }

  clone(): RetroTinkProfile {
    return new RetroTinkProfile(this._bytes);
  }

  merge(
    ...sources: (
      | RetroTinkProfile
      | RetroTinkSettingsValues
      | RetroTinkSettingValue
      | RetroTinkSettingsValuesPlainObject
    )[]
  ): RetroTinkProfile {
    const newProfile = this.clone();

    for (const source of sources) {
      if (source instanceof RetroTinkProfile) {
        RetroTinkProfile.mergeAllSettings(newProfile, source);
      } else if (source instanceof RetroTinkSettingsValues) {
        RetroTinkProfile.mergeSettingsValues(newProfile, source);
      } else if (source instanceof RetroTinkSettingValue) {
        RetroTinkProfile.mergeSettingValue(newProfile, source);
      } else {
        for (const setting of flattenObject(source)) {
          newProfile.setValue(setting.name as RetroTinkSettingName, setting.value);
        }
      }
    }

    return newProfile;
  }

  private static CRC_WRITE_INDEX = 32;
  private _getCrc(): Uint8Array {
    const START_INDEX = 128;

    const crcValue = CRC16CCITT.calculate(this._bytes, START_INDEX);
    return new Uint8Array([crcValue & 0xff, (crcValue >> 8) & 0xff]);
  }

  private _writeCrc(): void {
    this._bytes.set(this._getCrc(), RetroTinkProfile.CRC_WRITE_INDEX);
  }

  async save(filePath: string, opts: WriteFileOptions = { createDirectoryIfNotExist: true }) {
    this._writeCrc();
    return writeFileBinary(filePath, this._bytes, opts);
  }

  saveSync(filePath: string, opts: WriteFileOptions = { createDirectoryIfNotExist: true }) {
    this._writeCrc();
    return writeFileBinarySync(filePath, this._bytes, opts);
  }

  toString(): string {
    return this.serializeValues(true);
  }

  getCrcString(): string {
    const [lowByte, highByte] = this._getCrc();
    const crcValue = (highByte << 8) | lowByte;
    return `0x${crcValue.toString(16).toUpperCase().padStart(4, '0')}`;
  }
}
