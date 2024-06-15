import { DataType } from '../settings/DataType';
import RetroTinkProfileError, {
  InvalidProfileFormatError,
  ProfileNotFoundError,
  SettingNotSupportedError,
  SettingTypeError,
  SettingValidationError,
  SettingDeserializationError,
} from './RetroTinkProfileException';

describe('RetroTinkProfileError and derived classes', () => {
  it('should create a RetroTinkProfileError with the correct message and name', () => {
    const error = new RetroTinkProfileError('An error occurred');
    expect(error.message).toBe('An error occurred');
    expect(error.name).toBe('RetroTinkProfileError');
    expect(error.stack).toBeDefined();
  });

  it('should create an InvalidProfileFormatError with the default message and correct name', () => {
    const error = new InvalidProfileFormatError();
    expect(error.message).toBe('Invalid profile format');
    expect(error.name).toBe('InvalidProfileFormatError');
    expect(error.stack).toBeDefined();
  });

  it('should create a ProfileNotFoundError with the default message and correct name', () => {
    const error = new ProfileNotFoundError();
    expect(error.message).toBe('Profile not found');
    expect(error.name).toBe('ProfileNotFoundError');
    expect(error.stack).toBeDefined();
  });

  it('should create a SettingNotSupportedError with the correct message and name', () => {
    const settingKey = 'unsupportedSetting';
    const error = new SettingNotSupportedError(settingKey);
    expect(error.message).toBe(`Setting not supported: ${settingKey}`);
    expect(error.name).toBe('SettingNotSupportedError');
    expect(error.stack).toBeDefined();
  });

  it('should create a SettingTypeError with the correct message and name', () => {
    const settingKey = 'someSetting';
    const expectedType = DataType.STR;
    const receivedValue = 42;
    const error = new SettingTypeError(settingKey, expectedType, receivedValue);
    expect(error.message).toBe(
      `Wrong Type for Setting '${settingKey}' (expected: ${expectedType}, received: ${typeof receivedValue})`,
    );
    expect(error.name).toBe('SettingTypeError');
    expect(error.stack).toBeDefined();
  });

  it('should create a SettingValidationError with the correct message and name', () => {
    const settingKey = 'someSetting';
    const receivedValue = 42;
    const validationMessage = 'Value must be a string';
    const error = new SettingValidationError(settingKey, receivedValue, validationMessage);
    expect(error.message).toBe(`(${settingKey}) failed validation with (${receivedValue}) (${validationMessage})`);
    expect(error.name).toBe('SettingValidationError');
    expect(error.stack).toBeDefined();
  });

  it('should create a SettingDeserializationError with the default message and correct name', () => {
    const error = new SettingDeserializationError();
    expect(error.message).toBe('Failed to deserialize values');
    expect(error.name).toBe('SettingDeserializationError');
    expect(error.stack).toBeDefined();
  });
});
