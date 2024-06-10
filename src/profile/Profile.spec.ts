import { Profile } from './Profile';
import { RetroTinkSettingValue } from '../settings/RetroTinkSetting';

describe('Profile', () => {
  describe('builder', () => {
    test('should build a Profile using the default profile', async () => {
      const profile = await Profile.build();
      expect(profile).toBeInstanceOf(Profile);
      console.log(profile);
    });
  });
  describe('getValues', () => {
    test('should return the defaults', async () => {
      const profile = await Profile.build();
      const [header, enabled, strength, path] = profile.getValues();
      expect(header.asString()).toEqual('RT4K Profile');
      expect(enabled.asInt()).toEqual(0);
      expect(strength.asInt()).toEqual(0);
      expect(path.asString()).toEqual('');
    });
  });
});
