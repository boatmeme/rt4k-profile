import { DataType } from '../settings/DataType';
import { RetroTinkSettingsValues } from '../settings/RetroTinkSetting';

export type RetroTinkSettingsValuesSerialized = {
  [key: string]: string | number | boolean | RetroTinkSettingsValuesSerialized;
};

export function serializeSettings(settings: RetroTinkSettingsValues): RetroTinkSettingsValuesSerialized {
  const objectLiteral: RetroTinkSettingsValuesSerialized = {};

  Array.from(settings).forEach(([name, item]) => {
    const keys = name.split('.');
    let currentLevel: RetroTinkSettingsValuesSerialized | string | number | boolean = objectLiteral;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (i === keys.length - 1) {
        switch (item.type) {
          case DataType.STR:
            currentLevel[key] = item.asString();
            break;
          case DataType.BIT:
            currentLevel[key] = item.asBoolean();
            break;
          default:
            currentLevel[key] = item.asInt();
        }
      } else {
        currentLevel[key] = currentLevel[key] || {};
        currentLevel = currentLevel[key];
      }
    }
  });

  return objectLiteral;
}
