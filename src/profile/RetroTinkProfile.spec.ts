import { InvalidProfileFormatError, ProfileNotFoundError } from '../exceptions/RetroTinkProfileException';
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
  describe('setValues', () => {
    test('should overwrite the defaults', async () => {
      const profile = await RetroTinkProfile.build();
      let settings = profile.getValues();
      let strength = settings.get('advanced.effects.mask.strength');
      expect(strength?.asInt()).toEqual(0);
      strength?.fromInt(-6);
      profile.setValues(settings);
      settings = profile.getValues();
      strength = settings.get('advanced.effects.mask.strength');
      expect(strength?.asInt()).toEqual(-6);
    });
  });
});
