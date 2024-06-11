import { DataType } from './DataType';

export interface RetroTinkSetting {
  name: string;
  desc: string;
  address: number;
  length: number;
  type: DataType;
}

class RetroTinkBaseSettings<T extends RetroTinkSetting> extends Map<string, T> {
  constructor(settings: T[] = []) {
    super(settings.map((s) => [s.name, s]));
  }
}

export class RetroTinkSettings extends RetroTinkBaseSettings<RetroTinkSetting> {}
export class RetroTinkSettingsValues extends RetroTinkBaseSettings<RetroTinkSettingValue> {}

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
  fromString(str: string): void {
    const strLen = str.length;
    this.value = new Uint8Array(this.length);
    for (let i = 0; i < strLen && i < this.length; i++) {
      this.value[i] = str.charCodeAt(i);
    }
    if (strLen < this.length) {
      this.value[strLen] = 0; // null-terminate if there's space
    }
  }

  fromInt(num: number): void {
    this.value = new Uint8Array(this.length);
    if (this.length == 1) {
      if (this.type == DataType.SIGNED_INT) {
        if (num < -128 || num > 127) throw Error('Value out of range for signed 8-bit integer');
        this.value[0] = num < 0 ? 256 + num : num;
      } else {
        if (num < 0 || num > 255) throw Error('Value out of range for unsigned 8-bit integer');
        this.value[0] = num;
      }
    } else {
      throw Error('Not Implemented Yet');
    }
  }
}
