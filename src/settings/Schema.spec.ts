import { RetroTinkReadOnlySetting, RetroTinkSettingValue } from './RetroTinkSetting';
import { RetroTinkSettingName, RetroTinkSettingsVersion } from './Schema';
import { SettingValidationError } from '../exceptions/RetroTinkProfileException';

describe('Schema', () => {
  describe('1.4.2', () => {
    describe('derived settings', () => {
      describe('input.audio', () => {
        it('should vary with input', () => {
          const settings = RetroTinkSettingsVersion['1.4.2'];
          const inputs = settings.get('input').enums?.reduce((acc, e) => ({ ...acc, [e.name]: e.value }), {}) || {};
          const audio_input_override = new RetroTinkSettingValue(
            settings.get('advanced.acquisition.audio_input.source.input_override'),
            new Uint8Array([0]),
          );
          const input_audio = <RetroTinkReadOnlySetting>settings.get('input.audio' as RetroTinkSettingName);

          let input = new RetroTinkSettingValue(settings.get('input'), inputs['HDMI']);
          let [value] = input_audio.deriveValue(audio_input_override, input);
          expect(value).toEqual(5);

          input = new RetroTinkSettingValue(settings.get('input'), inputs['Front|Composite']);
          [value] = input_audio.deriveValue(audio_input_override, input);
          expect(value).toEqual(3);

          input = new RetroTinkSettingValue(settings.get('input'), inputs['RCA|RGsB']);
          [value] = input_audio.deriveValue(audio_input_override, input);
          expect(value).toEqual(0);

          input = new RetroTinkSettingValue(settings.get('input'), inputs['SCART|YPbPr']);
          [value] = input_audio.deriveValue(audio_input_override, input);
          expect(value).toEqual(2);

          input = new RetroTinkSettingValue(settings.get('input'), inputs['HD-15|RGBHV']);
          [value] = input_audio.deriveValue(audio_input_override, input);
          expect(value).toEqual(1);
        });
        it('should vary with audio input override', () => {
          const settings = RetroTinkSettingsVersion['1.4.2'];
          const inputs = settings.get('input').enums?.reduce((acc, e) => ({ ...acc, [e.name]: e.value }), {}) || {};
          const inputOverrides =
            settings
              .get('advanced.acquisition.audio_input.source.input_override')
              .enums?.reduce((acc, e) => ({ ...acc, [e.name]: e.value }), {}) || {};
          const input_audio = <RetroTinkReadOnlySetting>settings.get('input.audio' as RetroTinkSettingName);
          const input = new RetroTinkSettingValue(settings.get('input'), inputs['HDMI']);

          let audio_input_override = new RetroTinkSettingValue(
            settings.get('advanced.acquisition.audio_input.source.input_override'),
            inputOverrides['RCA'],
          );
          let [value] = input_audio.deriveValue(audio_input_override, input);
          expect(value).toEqual(0);

          audio_input_override = new RetroTinkSettingValue(
            settings.get('advanced.acquisition.audio_input.source.input_override'),
            inputOverrides['HD-15'],
          );
          [value] = input_audio.deriveValue(audio_input_override, input);
          expect(value).toEqual(1);

          audio_input_override = new RetroTinkSettingValue(
            settings.get('advanced.acquisition.audio_input.source.input_override'),
            inputOverrides['SCART'],
          );
          [value] = input_audio.deriveValue(audio_input_override, input);
          expect(value).toEqual(2);

          audio_input_override = new RetroTinkSettingValue(
            settings.get('advanced.acquisition.audio_input.source.input_override'),
            inputOverrides['Front'],
          );
          [value] = input_audio.deriveValue(audio_input_override, input);
          expect(value).toEqual(3);

          audio_input_override = new RetroTinkSettingValue(
            settings.get('advanced.acquisition.audio_input.source.input_override'),
            inputOverrides['S/PDIF'],
          );
          [value] = input_audio.deriveValue(audio_input_override, input);
          expect(value).toEqual(4);
        });

        it('should throw if there is a bad input value', () => {
          const settings = RetroTinkSettingsVersion['1.4.2'];
          const audio_input_override = new RetroTinkSettingValue(
            settings.get('advanced.acquisition.audio_input.source.input_override'),
            new Uint8Array([0]),
          );
          const input_audio = <RetroTinkReadOnlySetting>settings.get('input.audio' as RetroTinkSettingName);

          expect(() =>
            input_audio.deriveValue(audio_input_override, { asInt: () => 69 } as RetroTinkSettingValue),
          ).toThrow(SettingValidationError);
        });
      });
    });
  });
});
