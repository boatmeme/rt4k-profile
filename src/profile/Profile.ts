import { readFileBinary } from '../file/utils';
import { DataType } from '../settings/DataType';
import { RetroTinkSetting, RetroTinkSettingValue } from '../settings/RetroTinkSetting';

export class Profile {
  private _bytes: Uint8Array;
  private static _settings: RetroTinkSetting[] = [
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
  ];

  private constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  static async build(filename: string = `${__dirname}/default.rt4`) {
    const bytes = await readFileBinary(filename);
    return new Profile(bytes);
  }

  getValues(): RetroTinkSettingValue[] {
    return Profile._settings.map(
      (s) => new RetroTinkSettingValue(s, this._bytes.slice(s.address, s.address + s.length)),
    );
  }
}
