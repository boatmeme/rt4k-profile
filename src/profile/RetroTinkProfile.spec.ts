import {
  InvalidProfileFormatError,
  ProfileNotFoundError,
  SettingDeserializationError,
  SettingNotSupportedError,
} from '../exceptions/RetroTinkProfileException';
import { RetroTinkSetting, RetroTinkSettingValue, RetroTinkSettingsValues } from '../settings/RetroTinkSetting';
import { RetroTinkSettingName, RetroTinkSettingPath } from '../settings/Schema';
import RetroTinkProfile from './RetroTinkProfile';
import { bad_setting_json_str, invalid_json, pretty_json_str, unpretty_json_str } from './__fixtures__/json_profiles';
import { readFileBinarySync, writeFileBinary, writeFileBinarySync } from '../utils/FileUtils';

jest.mock('../utils/FileUtils', () => ({
  ...jest.requireActual('../utils/FileUtils'),
  writeFileBinary: jest.fn(),
  writeFileBinarySync: jest.fn(),
}));

const testBytes = readFileBinarySync(`${__dirname}/__fixtures__/mask-enabled-strength-10.rt4`);
const testFilePath = '/path/to/test/file.rt4';
const opts = { createDirectoryIfNotExist: true };

describe('RetroTinkProfile', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  describe('build()', () => {
    test('should build a Profile using the default profile', async () => {
      const profile = await RetroTinkProfile.build();
      expect(profile).toBeInstanceOf(RetroTinkProfile);
    });
    test('should throw an error with an invalid file', async () => {
      await expect(RetroTinkProfile.build(`${__dirname}/__fixtures__/not-a-valid-profile.rt4`)).rejects.toThrow(
        InvalidProfileFormatError,
      );
    });
    test('should throw an error with a bad path', async () => {
      await expect(RetroTinkProfile.build(`${__dirname}/__fixtures__/not-exists.rt4`)).rejects.toThrow(
        ProfileNotFoundError,
      );
    });
  });
  describe('buildSync()', () => {
    test('should build a Profile using the default profile', () => {
      const profile = RetroTinkProfile.buildSync();
      expect(profile).toBeInstanceOf(RetroTinkProfile);
    });
    test('should throw an error with an invalid file', async () => {
      expect(() => RetroTinkProfile.buildSync(`${__dirname}/__fixtures__/not-a-valid-profile.rt4`)).toThrow(
        InvalidProfileFormatError,
      );
    });
    test('should throw an error with a bad path', async () => {
      expect(() => RetroTinkProfile.buildSync(`${__dirname}/__fixtures__/not-exists.rt4`)).toThrow(
        ProfileNotFoundError,
      );
    });
  });
  describe('getSettingsNames', () => {
    test('should return the names of all settings', async () => {
      const profile = await RetroTinkProfile.build();
      const settings = profile.getSettingsNames();
      expect(settings).toBeInstanceOf(Array);
    });
  });
  describe('serializeValues', () => {
    test('should convert profile settings into Json (pretty = false)', async () => {
      const profile = await RetroTinkProfile.build();
      profile.setValue('advanced.effects.mask.enabled', 1);
      profile.setValue('advanced.effects.mask.strength', -4);
      profile.setValue('advanced.effects.mask.path', 'Mono Masks/A Grille Medium Mono.bmp');
      const settings = profile.serializeValues();
      expect(typeof settings).toBe('string');
      expect(settings).toBe(unpretty_json_str);
    });
    test('should convert profile settings into Json (pretty = true)', async () => {
      const profile = await RetroTinkProfile.build();
      profile.setValue('advanced.effects.mask.enabled', 1);
      profile.setValue('advanced.effects.mask.strength', -4);
      profile.setValue('advanced.effects.mask.path', 'Mono Masks/A Grille Medium Mono.bmp');
      const settings = profile.serializeValues(true);
      expect(typeof settings).toBe('string');
      expect(settings).toBe(pretty_json_str);
    });
  });
  describe('deserializeValues', () => {
    test('should convert profile settings into Json (pretty = false)', async () => {
      const profile = await RetroTinkProfile.build();
      profile.deserializeValues(pretty_json_str);
      const settings = profile.getValues();
      expect(settings).toBeInstanceOf(RetroTinkSettingsValues);
      expect(settings.get('header')?.asString()).toEqual('RT4K Profile');
      expect(settings.get('advanced.effects.mask.enabled')?.asInt()).toEqual(1);
      expect(settings.get('advanced.effects.mask.strength')?.asInt()).toEqual(-4);
      expect(settings.get('advanced.effects.mask.path')?.asString()).toEqual('Mono Masks/A Grille Medium Mono.bmp');
    });
    test('should throw error for invalid json', async () => {
      const profile = await RetroTinkProfile.build();
      expect(() => profile.deserializeValues(invalid_json)).toThrow(SettingDeserializationError);
    });
    test('should throw error for invalid plain object', async () => {
      const profile = await RetroTinkProfile.build();
      expect(() => profile.deserializeValues(`{ "root": [{"child":"cannot accept arrays"}]}`)).toThrow(
        SettingDeserializationError,
      );
    });
    test('should throw error for invalid setting', async () => {
      const profile = await RetroTinkProfile.build();
      expect(() => profile.deserializeValues(bad_setting_json_str)).toThrow(SettingDeserializationError);
    });
  });
  describe('getValues', () => {
    test('should return the defaults', async () => {
      const profile = await RetroTinkProfile.build();
      const settings = profile.getValues();
      expect(settings.get('header')?.asString()).toEqual('RT4K Profile');
      expect(settings.get('advanced.effects.mask.enabled')?.asInt()).toEqual(0);
      expect(settings.get('advanced.effects.mask.strength')?.asInt()).toEqual(0);
      expect(settings.get('advanced.effects.mask.path')?.asString()).toEqual('');
    });
    test('should load the settings for whichever file you specify', async () => {
      const profile = await RetroTinkProfile.build(`${__dirname}/__fixtures__/mask-enabled-strength-10.rt4`);
      const settings = profile.getValues();
      expect(settings.get('header')?.asString()).toEqual('RT4K Profile');
      expect(settings.get('advanced.effects.mask.enabled')?.asInt()).toEqual(1);
      expect(settings.get('advanced.effects.mask.strength')?.asInt()).toEqual(10);
      expect(settings.get('advanced.effects.mask.path')?.asString()).toEqual('');
    });
  });
  describe('getValue', () => {
    test('should return the value for a valid setting', async () => {
      const profile = await RetroTinkProfile.build(`${__dirname}/__fixtures__/mask-enabled-strength-10.rt4`);
      const setting = profile.getValue('advanced.effects.mask.strength');
      expect(setting.asInt()).toEqual(10);
    });
    test('should throw for an invalid setting', async () => {
      const profile = await RetroTinkProfile.build(`${__dirname}/__fixtures__/mask-enabled-strength-10.rt4`);
      expect(() => profile.getValue('some.bunko.setting' as RetroTinkSettingName)).toThrow(SettingNotSupportedError);
    });
  });
  describe('setValues', () => {
    test('should overwrite the defaults', async () => {
      const profile = await RetroTinkProfile.build();
      let settings = profile.getValues();
      let strength = settings.get('advanced.effects.mask.strength');
      expect(strength?.asInt()).toEqual(0);
      strength.set(-6);
      profile.setValues(settings);
      settings = profile.getValues();
      strength = settings.get('advanced.effects.mask.strength');
      expect(strength?.asInt()).toEqual(-6);
    });
  });
  describe('setValue', () => {
    test('should overwrite the defaults', async () => {
      const profile = await RetroTinkProfile.build();
      let settings = profile.getValues();
      let strength = settings.get('advanced.effects.mask.strength');
      expect(strength).toBeDefined();
      expect(strength.asInt()).toEqual(0);
      strength.set(-6);
      profile.setValue(strength);
      settings = profile.getValues();
      strength = settings.get('advanced.effects.mask.strength');
      expect(strength?.asInt()).toEqual(-6);
      expect(strength.value).toEqual(new Uint8Array([250]));
    });
    test('unsupported setting should throw ', async () => {
      const profile = await RetroTinkProfile.build();
      const setting = new RetroTinkSettingValue(
        {
          name: 'something.unsupported' as RetroTinkSettingPath,
        } as RetroTinkSetting,
        new Uint8Array([250]),
      );
      expect(() => profile.setValue(setting)).toThrow(SettingNotSupportedError);
    });
  });
  describe('merge', () => {
    test('should merge values from 2 or more RetroTinkProfile instances into a new profile instance', async () => {
      const p1 = await RetroTinkProfile.build();
      p1.setValue('output.resolution', '1440p60');
      const p2 = p1.clone();
      p2.setValue('input', 'Front|S-Video');
      const p3 = p1.clone();
      p3.setValue('advanced.effects.mask.strength', -4);
      const p4 = p1.merge(p2, p3);
      expect(p4.getValue('output.resolution').asString()).toEqual('1440p60');
      expect(p4.getValue('advanced.effects.mask.strength').asInt()).toEqual(-4);
      expect(p4.getValue('input').asString()).toEqual('HDMI');
      expect(p1.getValue('input').asString()).toEqual('HDMI');
    });
    test('should merge values from 2 or more RetroTinkSettingsValues instances into a new profile instance', async () => {
      const p1 = await RetroTinkProfile.build();
      p1.setValue('output.resolution', '1440p60');
      const p2 = p1.clone();
      p2.setValue('input', 'Front|S-Video');
      const p3 = p1.clone();
      p3.setValue('output.transmitter.colorimetry', 3);
      p3.setValue('input', 'Front|Composite');
      p3.setValue('output.transmitter.hdr', 2);
      const p4 = p1.clone();
      p4.setValue('output.transmitter.hdr', 1);
      p4.setValue('output.transmitter.colorimetry', 2);

      const p5 = p1.merge(p2.getValues('input'), p3.getValues('output'), p4.getValues('output.transmitter.hdr'));

      expect(p5.getValue('output.resolution').asString()).toEqual(p4.getValue('output.resolution').asString());
      expect(p5.getValue('output.transmitter.colorimetry').asString()).toEqual(
        p3.getValue('output.transmitter.colorimetry').asString(),
      );
      expect(p5.getValue('output.transmitter.hdr').asString()).toEqual(
        p4.getValue('output.transmitter.hdr').asString(),
      );
      expect(p5.getValue('input').asString()).toEqual(p2.getValue('input').asString());
      expect(p3.getValue('input').asString()).toEqual('Front|Composite');
      expect(p1.getValue('input').asString()).toEqual('HDMI');
    });
    test('should merge values from 2 or more RetroTinkPlainObject instances into a new profile instance', async () => {
      const p1 = await RetroTinkProfile.build();
      p1.setValue('output.resolution', '1440p60');
      const p2 = p1.clone();
      p2.setValue('input', 'Front|S-Video');
      p2.setValue('output.resolution', '1080p100');
      const p3 = p1.clone();
      p3.setValue('output.transmitter.colorimetry', 3);
      p3.setValue('input', 'Front|Composite');
      p3.setValue('output.transmitter.hdr', 2);
      const p4 = p1.clone();
      p4.setValue('output.transmitter.hdr', 1);
      p4.setValue('output.transmitter.colorimetry', 2);

      const p5 = p1.merge(
        p2.getValues('input').asPlainObject(),
        p3.getValues(/^output.*/).asPlainObject(),
        p4.getValues('output.transmitter.hdr').asPlainObject(),
      );

      expect(p5.getValue('output.resolution').asString()).toEqual(p4.getValue('output.resolution').asString());
      expect(p5.getValue('output.transmitter.colorimetry').asString()).toEqual(
        p3.getValue('output.transmitter.colorimetry').asString(),
      );
      expect(p5.getValue('output.transmitter.hdr').asString()).toEqual(
        p4.getValue('output.transmitter.hdr').asString(),
      );
      expect(p5.getValue('input').asString()).toEqual(p2.getValue('input').asString());
      expect(p3.getValue('input').asString()).toEqual('Front|Composite');
      expect(p1.getValue('input').asString()).toEqual('HDMI');
    });
    test('should merge values from 2 or more RetroTinkSettingValue instances into a new profile instance', async () => {
      const p1 = await RetroTinkProfile.build();
      p1.setValue('output.resolution', '1440p60');
      const p2 = p1.clone();
      p2.setValue('input', 'Front|S-Video');
      p2.setValue('output.resolution', '1080p100');
      const p3 = p1.clone();
      p3.setValue('output.transmitter.colorimetry', 3);
      p3.setValue('input', 'Front|Composite');
      p3.setValue('output.transmitter.hdr', 2);
      const p4 = p1.clone();
      p4.setValue('output.transmitter.hdr', 1);
      p4.setValue('output.transmitter.colorimetry', 2);

      const p5 = p1.merge(
        p2.getValue('input'),
        p3.getValue('output.transmitter.colorimetry'),
        p4.getValue('output.transmitter.hdr'),
      );

      expect(p5.getValue('output.resolution').asString()).toEqual(p4.getValue('output.resolution').asString());
      expect(p5.getValue('output.transmitter.colorimetry').asString()).toEqual(
        p3.getValue('output.transmitter.colorimetry').asString(),
      );
      expect(p5.getValue('output.transmitter.hdr').asString()).toEqual(
        p4.getValue('output.transmitter.hdr').asString(),
      );
      expect(p5.getValue('input').asString()).toEqual(p2.getValue('input').asString());
      expect(p3.getValue('input').asString()).toEqual('Front|Composite');
      expect(p1.getValue('input').asString()).toEqual('HDMI');
    });
  });
  describe('save', () => {
    it('should save the profile asynchronously (default opts)', async () => {
      const profile = RetroTinkProfile.fromBytes(testBytes);
      (writeFileBinary as jest.Mock).mockImplementation(() => {
        return Promise.resolve();
      });

      await profile.save(testFilePath);
      expect(writeFileBinary).toHaveBeenCalledWith(testFilePath, testBytes, opts);
    });
    it('should save the profile asynchronously (specify opts)', async () => {
      const profile = RetroTinkProfile.fromBytes(testBytes);
      (writeFileBinary as jest.Mock).mockImplementation(() => {
        return Promise.resolve();
      });

      await profile.save(testFilePath, { createDirectoryIfNotExist: false });
      expect(writeFileBinary).toHaveBeenCalledWith(testFilePath, testBytes, { createDirectoryIfNotExist: false });
    });
  });

  describe('saveSync', () => {
    it('should save the profile synchronously (default opts)', () => {
      const profile = RetroTinkProfile.fromBytes(testBytes);
      profile.saveSync(testFilePath);
      expect(writeFileBinarySync).toHaveBeenCalledWith(testFilePath, testBytes, opts);
    });
    it('should save the profile synchronously (specify opts)', () => {
      const profile = RetroTinkProfile.fromBytes(testBytes);
      profile.saveSync(testFilePath, { createDirectoryIfNotExist: false });
      expect(writeFileBinarySync).toHaveBeenCalledWith(testFilePath, testBytes, { createDirectoryIfNotExist: false });
    });
  });
});
