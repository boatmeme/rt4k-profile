import { DataType } from '../settings/DataType';

export default class RetroTinkProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidProfileFormatError extends RetroTinkProfileError {
  constructor(message = 'Invalid profile format') {
    super(message);
  }
}

export class ProfileNotFoundError extends RetroTinkProfileError {
  constructor(message = 'Profile not found') {
    super(message);
  }
}

export class SettingNotSupportedError extends RetroTinkProfileError {
  constructor(settingKey: string, message = `Setting not supported: ${settingKey}`) {
    super(message);
  }
}

export class SettingTypeError extends RetroTinkProfileError {
  constructor(
    settingKey: string,
    expected: DataType,
    val: unknown,
    message = `Wrong Type for Setting '${settingKey}' (expected: ${expected}, received: ${typeof val})`,
  ) {
    super(message);
  }
}

export class SettingValidationError extends RetroTinkProfileError {
  constructor(settingKey: string, val: unknown, message: string) {
    super(`(${settingKey}) failed validation with (${val}) (${message})`);
  }
}
