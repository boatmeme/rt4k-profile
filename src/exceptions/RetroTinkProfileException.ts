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
