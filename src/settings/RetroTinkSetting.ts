import { DataType } from './DataType';

export interface RetroTinkSetting {
  name: string;
  desc: string;
  address: number;
  length: number;
  type: DataType;
}

export class RetroTinkSettingValue implements RetroTinkSetting {
  name: string;
  desc: string;
  address: number;
  length: number;
  type: DataType;
  value: Uint8Array;

  constructor(setting: RetroTinkSetting, value: Uint8Array) {
    Object.assign(this, setting);
    this.value = value;
  }

  asString(): string {
    if (this.value[0] == 0) return '';
    return String.fromCharCode(...this.value);
  }

  asInt(): number {
    if (this.length == 1) {
      if (this.type == DataType.SIGNED_INT) {
        const unsignedInt = this.value[0] & 0xff;
        return unsignedInt & 0x80 ? unsignedInt - 256 : unsignedInt;
      }
      return this.value[0];
    }
    throw Error('Not Implemented Yet');
  }
}
