import { readFileBinary, readFileBinarySync } from '../utils/FileUtils';
import { DataType } from '../settings/DataType';
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

type ProfileScope = string | RegExp | ((key: string) => boolean);

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
    new RetroTinkSetting({
      name: 'output.transmitter.colorimetry',
      desc: 'HDMI Output -> Transmitter -> Colorimetry',
      byteRanges: [{ address: 0x1ec8, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Auto-Rec.709', value: new Uint8Array([0]) },
        { name: 'Rec.709', value: new Uint8Array([1]) },
        { name: 'Rec.2020', value: new Uint8Array([2]) },
        { name: 'Adobe RGB', value: new Uint8Array([3]) },
        { name: 'Display-P3', value: new Uint8Array([4]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.transmitter.rgb_range',
      desc: 'HDMI Output -> Transmitter -> RGB Range',
      byteRanges: [{ address: 0x1f08, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Full', value: new Uint8Array([0]) },
        { name: 'Limited', value: new Uint8Array([1]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.transmitter.sync_lock',
      desc: 'HDMI Output -> Transmitter -> Sync Lock',
      byteRanges: [{ address: 0x2d8, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Triple Buffer', value: new Uint8Array([0]) },
        { name: 'Gen Lock', value: new Uint8Array([1]) },
        { name: 'Frame Lock', value: new Uint8Array([2]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.transmitter.vrr',
      desc: 'HDMI Output -> Transmitter -> VRR',
      byteRanges: [{ address: 0x2dc, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Off', value: new Uint8Array([0]) },
        { name: 'FreeSync', value: new Uint8Array([1]) },
        { name: 'VESA', value: new Uint8Array([2]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.transmitter.deep_color',
      desc: 'HDMI Output -> Transmitter -> Deep Color',
      byteRanges: [{ address: 0x2d4, length: 1 }],
      type: DataType.BIT,
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

  static get(key: string): RetroTinkSetting {
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

  private _setValueWithPrimitive(settingsKey: string, val: string | number | boolean): void {
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

  private static matchesAnyScope(key: string, scopes: ProfileScope[]): boolean {
    return scopes.some((scope) => {
      if (typeof scope === 'string') return key.startsWith(scope);
      if (scope instanceof RegExp) return scope.test(key);
      if (typeof scope === 'function') return scope(key);
    });
  }

  getSettingsNames(): string[] {
    return Array.from(RetroTinkProfile._settings).map(([, s]) => s.name);
  }

  getValues(...scopes: ProfileScope[]): RetroTinkSettingsValues {
    const filterScope = scopes.length == 0 ? [() => true] : scopes;
    return new RetroTinkSettingsValues(
      Array.from(RetroTinkProfile._settings, ([, s]) => new RetroTinkSettingValue(s, this.sliceBytes(s))).filter((s) =>
        RetroTinkProfile.matchesAnyScope(s.name, filterScope),
      ),
    );
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

  setValue(setting: RetroTinkSettingValue): void;
  setValue(a: string, b: string | number | boolean): void;
  setValue(a: unknown, b?: string | number | boolean): void {
    if (typeof a === 'string' && (typeof b === 'number' || typeof b === 'string' || typeof b === 'boolean')) {
      return this._setValueWithPrimitive(a, b);
    } else if (a instanceof RetroTinkSettingValue) {
      return this._setValueWithInstance(a);
    }
  }

  serializeValues(pretty: boolean = false): string {
    return JSON.stringify(this.getValues().asPlainObject(), null, pretty ? 2 : 0);
  }

  deserializeValues(json: string): void {
    try {
      const parsedObject = JSON.parse(json);
      for (const setting of flattenObject(parsedObject)) {
        this.setValue(setting.name, setting.value);
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
          newProfile.setValue(setting.name, setting.value);
        }
      }
    }

    return newProfile;
  }
}
