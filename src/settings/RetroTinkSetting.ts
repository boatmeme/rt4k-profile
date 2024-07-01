import {
  SettingNotSupportedError,
  SettingTypeError,
  SettingValidationError,
} from '../exceptions/RetroTinkProfileException';
import { addValueToObject, deepMerge } from '../utils/ObjectUtils';
import { DataType } from './DataType';
import { RetroTinkSettingName } from './Schema';

interface ByteRange {
  address: number;
  length: number;
}

interface RetroTinkSettingParams {
  name: RetroTinkSettingName;
  desc: string;
  byteRanges: ByteRange[];
  type: DataType;
  enums?: RetroTinkEnumValue[];
}

interface RetroTinkEnumValue {
  name: string;
  value: Uint8Array;
}

export class RetroTinkSetting {
  name: RetroTinkSettingName;
  desc: string;
  byteRanges: ByteRange[];
  type: DataType;
  enums?: RetroTinkEnumValue[];

  constructor(params: RetroTinkSettingParams) {
    this.name = params.name;
    this.desc = params.desc;
    this.byteRanges = params.byteRanges;
    this.type = params.type;
    this.enums = params.enums;
  }
  length(): number {
    return this.byteRanges.reduce((acc, r) => acc + r.length, 0);
  }
  validValues(): string[] {
    switch (this.type) {
      case DataType.ENUM: {
        return this.enums.map((s) => s.name);
      }
      case DataType.INT: {
        return ['number between 0 and 255'];
      }
      case DataType.SIGNED_INT: {
        return ['number between -128 and 128'];
      }
      case DataType.BIT: {
        return ['boolean', 'number between 0 and 1'];
      }
      case DataType.STR: {
        return ['string'];
      }
    }
  }
}

export class RetroTinkReadOnlySetting extends RetroTinkSetting {}

export type RetroTinkSettingsValuesPlainObject = {
  [key: string]: string | number | boolean | RetroTinkSettingsValuesPlainObject;
};
class RetroTinkBaseSettings<T extends RetroTinkSetting> extends Map<string, T> {
  constructor(settings: T[] = []) {
    super(settings.map((s) => [s.name, s]));
  }

  get<S extends RetroTinkSettingName>(key: S): T {
    if (!this.has(key)) throw new SettingNotSupportedError(key);
    return super.get(key);
  }
  set<S extends RetroTinkSettingName>(key: S, value: T) {
    return super.set(key, value);
  }
}

export class RetroTinkSettings extends RetroTinkBaseSettings<RetroTinkSetting> {}
export class RetroTinkSettingsValues extends RetroTinkBaseSettings<RetroTinkSettingValue> {
  asPlainObject(): RetroTinkSettingsValuesPlainObject {
    const pojo: RetroTinkSettingsValuesPlainObject = {};

    Array.from(this).forEach(([, item]) => {
      deepMerge(pojo, item.asPlainObject());
    });

    return pojo;
  }
}

export class RetroTinkSettingValue extends RetroTinkSetting {
  value: Uint8Array;

  constructor(params: RetroTinkSetting, value?: Uint8Array) {
    super(params);
    if (!value) {
      this.value = new Uint8Array(params.length());
    } else {
      this.value = value;
      this.validate();
    }
  }

  private validate(): boolean {
    switch (this.type) {
      case DataType.ENUM: {
        const enumVal = this.enums?.find((e) => RetroTinkSettingValue.compareUint8Array(e.value, this.value));
        if (enumVal) return true;
        const errDesc = this.byteRanges
          .reduce((str, r) => [...str, `<addr: ${r.address}, len: ${r.length}>`], [] as string[])
          .join(', ');
        throw new SettingValidationError(this.name, this.value, `Invalid values @ bytes: ${errDesc}`);
      }
      default:
        return true;
    }
  }

  static compareUint8Array(a: Uint8Array, b: Uint8Array) {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }

  asString(): string {
    switch (this.type) {
      case DataType.ENUM: {
        const enumVal = this.enums?.find((e) => RetroTinkSettingValue.compareUint8Array(e.value, this.value));
        return enumVal.name;
      }
      default:
        if (this.value[0] == 0) return '';
        return String.fromCharCode(...this.value.filter((n) => n));
    }
  }

  asBoolean(): boolean {
    if (this.value[0] == 0) return false;
    return true;
  }

  asInt(): number {
    const length = this.length();
    if (length == 1) {
      if (this.type == DataType.SIGNED_INT) {
        const unsignedInt = this.value[0] & 0xff;
        return unsignedInt & 0x80 ? unsignedInt - 256 : unsignedInt;
      }
      return this.value[0];
    }
    throw new SettingTypeError(
      this.name,
      this.type,
      this.value,
      `asInt() Not Implemented Yet for '${this.name}', Length: ${length} (expected: ${this.type}, received: ${typeof this.value})`,
    );
  }

  set(val: string | number | boolean) {
    if (typeof val === 'string') {
      switch (this.type) {
        case DataType.STR:
          return this.fromString(val);
        case DataType.BIT:
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
        case DataType.ENUM:
          return this.fromString(val);
        default:
          throw new SettingTypeError(this.name, this.type, val);
      }
    } else if (typeof val === 'number') {
      switch (this.type) {
        case DataType.INT:
          return this.fromInt(val);
        case DataType.SIGNED_INT:
          return this.fromInt(val);
        case DataType.BIT:
          return this.fromInt(val);
        case DataType.STR:
          return this.fromString(`${val}`);
        case DataType.ENUM:
          return this.fromInt(val);
        default:
          throw new SettingTypeError(this.name, this.type, val);
      }
    } else if (typeof val === 'boolean') {
      switch (this.type) {
        case DataType.INT:
          return this.fromInt(val ? 1 : 0);
        case DataType.SIGNED_INT:
          return this.fromInt(val ? 1 : 0);
        case DataType.STR:
          return this.fromString(`${val}`);
        case DataType.BIT:
          return this.fromBool(val);
        default:
          throw new SettingTypeError(this.name, this.type, val);
      }
    }
    throw new SettingTypeError(this.name, this.type, val);
  }

  private fromString(str: string): void {
    const length = this.length();
    this.value = new Uint8Array(length);
    if (this.type == DataType.BIT) {
      if (length == 1) {
        if (str == 'true') {
          this.value[0] = 1;
        } else if (str == 'false') {
          this.value[0] = 0;
        } else {
          throw new SettingValidationError(this.name, str, `Cannot represent value (${str}) as a bit`);
        }
      } else {
        throw new SettingValidationError(this.name, str, `Length (${length}) greater than 1`);
      }
    } else if (this.type == DataType.ENUM) {
      const lowerString = str.toLowerCase();
      const enumValue = this.enums?.find((e) => e.name.toLowerCase() == lowerString);
      if (!enumValue) {
        const validStrArr = this.enums.map((e) => `'${e.name}'`);
        throw new SettingValidationError(this.name, str, `Must be one of: ${validStrArr.join(', ')}`);
      }
      this.value = enumValue.value;
    } else {
      const strLen = str.length;
      for (let i = 0; i < strLen && i < length; i++) {
        this.value[i] = str.charCodeAt(i);
      }
      if (strLen < length) {
        this.value[strLen] = 0; // null-terminate if there's space
      }
    }
  }

  private fromInt(num: number): void {
    const length = this.length();
    this.value = new Uint8Array(length);
    if (this.type == DataType.ENUM) {
      if (num >= this.enums.length || num < 0) {
        throw new SettingValidationError(this.name, num, 'No Enum Found with that Index');
      }
      this.value = this.enums[num].value;
    } else if (length == 1) {
      if (this.type == DataType.SIGNED_INT) {
        if (num < -128 || num > 127)
          throw new SettingValidationError(this.name, num, 'Value out of range for signed 8-bit integer');
        this.value[0] = num < 0 ? 256 + num : num;
      } else if (this.type == DataType.BIT) {
        if (num < 0 || num > 1) throw new SettingValidationError(this.name, num, 'Value out of range for bit');
        this.value[0] = num;
      } else {
        if (num < 0 || num > 255)
          throw new SettingValidationError(this.name, num, 'Value out of range for 8-bit integer');
        this.value[0] = num;
      }
    } else {
      throw new SettingTypeError(
        this.name,
        this.type,
        num,
        `fromInt() Not Implemented Yet: for '${this.name}', Length: ${length} (expected: ${this.type}, received: ${typeof num})`,
      );
    }
  }

  private fromBool(bool: boolean): void {
    const length = this.length();
    this.value = new Uint8Array(length);
    if (length > 0) {
      this.value[0] = bool ? 1 : 0;
    }
  }

  asPlainObject(): RetroTinkSettingsValuesPlainObject {
    const pojo: RetroTinkSettingsValuesPlainObject = {};

    const keys = this.name.split('.');
    let value: string | number | boolean;

    switch (this.type) {
      case DataType.STR:
        value = this.asString();
        break;
      case DataType.ENUM:
        value = this.asString();
        break;
      case DataType.BIT:
        value = this.asBoolean();
        break;
      default:
        value = this.asInt();
    }

    addValueToObject(pojo, keys, value);
    return pojo;
  }
}
