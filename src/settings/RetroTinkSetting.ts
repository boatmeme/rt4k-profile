import {
  SettingNotSupportedError,
  SettingTypeError,
  SettingValidationError,
} from '../exceptions/RetroTinkProfileException';
import { DataType } from './DataType';

interface RetroTinkSettingParams {
  name: string;
  desc: string;
  address: number;
  length: number;
  type: DataType;
}

export class RetroTinkSetting {
  name: string;
  desc: string;
  address: number;
  length: number;
  type: DataType;

  constructor(params: RetroTinkSettingParams) {
    this.name = params.name;
    this.desc = params.desc;
    this.address = params.address;
    this.length = params.length;
    this.type = params.type;
  }
}

class RetroTinkBaseSettings<T extends RetroTinkSetting> extends Map<string, T> {
  constructor(settings: T[] = []) {
    super(settings.map((s) => [s.name, s]));
  }

  get(key: string): T {
    if (!this.has(key)) throw new SettingNotSupportedError(key);
    return super.get(key);
  }
}

export class RetroTinkSettings extends RetroTinkBaseSettings<RetroTinkSetting> {}
export class RetroTinkSettingsValues extends RetroTinkBaseSettings<RetroTinkSettingValue> {}

export class RetroTinkSettingValue extends RetroTinkSetting {
  name: string;
  desc: string;
  address: number;
  length: number;
  type: DataType;
  value: Uint8Array;

  constructor(params: RetroTinkSetting, value: Uint8Array = new Uint8Array(params.length)) {
    super(params);
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

  set(val: string | number) {
    if (typeof val === 'string') {
      switch (this.type) {
        case DataType.STR:
          return this.fromString(val);
        case DataType.INT: {
          const v = parseInt(val, 10);
          if (isNaN(v)) throw new SettingTypeError(this.name, this.type, val);
          return this.fromInt(v);
        }
        case DataType.SIGNED_INT: {
          const v = parseInt(val, 10);
          if (isNaN(v)) throw new SettingTypeError(this.name, this.type, val);
          return this.fromInt(v);
        }
        default:
          throw new SettingTypeError(this.name, this.type, val);
      }
    } else if (typeof val === 'number') {
      switch (this.type) {
        case DataType.INT:
          return this.fromInt(val);
        case DataType.SIGNED_INT:
          return this.fromInt(val);
        case DataType.STR:
          return this.fromString(`${val}`);
        default:
          throw new SettingTypeError(this.name, this.type, val);
      }
    }
    throw new SettingTypeError(this.name, this.type, val);
  }

  private fromString(str: string): void {
    const strLen = str.length;
    this.value = new Uint8Array(this.length);
    for (let i = 0; i < strLen && i < this.length; i++) {
      this.value[i] = str.charCodeAt(i);
    }
    if (strLen < this.length) {
      this.value[strLen] = 0; // null-terminate if there's space
    }
  }

  private fromInt(num: number): void {
    this.value = new Uint8Array(this.length);
    if (this.length == 1) {
      if (this.type == DataType.SIGNED_INT) {
        if (num < -128 || num > 127)
          throw new SettingValidationError(this.name, num, 'Value out of range for signed 8-bit integer');
        this.value[0] = num < 0 ? 256 + num : num;
      } else {
        if (num < 0 || num > 255)
          throw new SettingValidationError(this.name, num, 'Value out of range for signed 8-bit integer');
        this.value[0] = num;
      }
    } else {
      throw Error('Not Implemented Yet');
    }
  }
}
