import {
  InvalidProfileFormatError,
  ProfileNotFoundError,
  SettingNotSupportedError,
} from '../exceptions/RetroTinkProfileException';
import { RetroTinkSetting, RetroTinkSettingValue } from '../settings/RetroTinkSetting';
import { RetroTinkProfile } from './RetroTinkProfile';
//import { RetroTinkSettingValue } from '../settings/RetroTinkSetting';

describe('RetroTinkProfile', () => {
  describe('builder', () => {
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
      expect(() => profile.getValue('some.bunko.setting')).toThrow(SettingNotSupportedError);
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
          name: 'something.unsupported',
        } as RetroTinkSetting,
        new Uint8Array([250]),
      );
      expect(() => profile.setValue(setting)).toThrow(SettingNotSupportedError);
    });
  });
});
