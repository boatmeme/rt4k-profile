import { readFileBinary } from '../utils/FileUtils';
import { DataType } from '../settings/DataType';
import { RetroTinkSettingValue, RetroTinkSettings, RetroTinkSettingsValues } from '../settings/RetroTinkSetting';
import { InvalidProfileFormatError, SettingNotSupportedError } from '../exceptions/RetroTinkProfileException';

export class RetroTinkProfile {
  private _bytes: Uint8Array;
  private static _settings: RetroTinkSettings = new RetroTinkSettings([
    {
      name: 'header',
      desc: 'File Header',
      address: 0x0000,
      length: 12,
      type: DataType.STR,
    },
    {
      name: 'advanced.effects.mask.enabled',
      desc: 'Advanced -> Processing -> Mask -> Enabled',
      address: 0x008c,
      length: 1,
      type: DataType.INT,
    },
    {
      name: 'advanced.effects.mask.strength',
      desc: 'Advanced -> Processing -> Mask -> Strength',
      address: 0x02a0,
      length: 1,
      type: DataType.SIGNED_INT,
    },
    {
      name: 'advanced.effects.mask.path',
      desc: 'Advanced -> Processing -> Mask -> Path',
      address: 0x0090,
      length: 256,
      type: DataType.STR,
    },
  ]);

  private constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  static async build(filename: string = `${__dirname}/default.rt4`) {
    const bytes = await readFileBinary(filename);
    const header = this._settings.get('header');
    const headerValue = new RetroTinkSettingValue(
      header,
      bytes.slice(header.address, header.address + header.length),
    ).asString();
    if (headerValue !== 'RT4K Profile') throw new InvalidProfileFormatError(`Header is invalid: ${headerValue}`);
    return new RetroTinkProfile(bytes);
  }

  getValues(): RetroTinkSettingsValues {
    return new RetroTinkSettingsValues(
      Array.from(
        RetroTinkProfile._settings,
        ([, s]) => new RetroTinkSettingValue(s, this._bytes.slice(s.address, s.address + s.length)),
      ),
    );
  }

  getValue(key: string): RetroTinkSettingValue {
    const setting = RetroTinkProfile._settings.get(key);
    return new RetroTinkSettingValue(setting, this._bytes.slice(setting.address, setting.address + setting.length));
  }

  setValues(settings: RetroTinkSettingsValues): void {
    const byte_array = Array.from(this._bytes);
    for (const setting of settings.values()) {
      byte_array.splice(setting.address, setting.length, ...setting.value);
    }
    this._bytes = new Uint8Array(byte_array);
  }

  setValue(setting: RetroTinkSettingValue): void {
    if (!RetroTinkProfile._settings.has(setting.name)) throw new SettingNotSupportedError(setting.name);
    const byte_array = Array.from(this._bytes);
    byte_array.splice(setting.address, setting.length, ...setting.value);
    this._bytes = new Uint8Array(byte_array);
  }
}
