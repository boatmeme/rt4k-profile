import { DataType } from './DataType';
import {
  RetroTinkReadOnlySetting,
  RetroTinkSetting,
  RetroTinkSettingValue,
  RetroTinkSettings,
} from './RetroTinkSetting';

export type Primitive = string | number | boolean;

// The terminal nodes that hold the value, in the schema
type SettingName<T, K extends string = ''> = {
  [P in keyof T]: T[P] extends Primitive
    ? K extends ''
      ? `${P & string}`
      : `${K}.${P & string}`
    : T[P] extends object
      ? SettingName<T[P], K extends '' ? `${P & string}` : `${K}.${P & string}`>
      : never;
}[keyof T];

export type RetroTinkSettingName = SettingName<RetroTinkSettingsSchema>;

// The "intermediate" nodes that represent groups of settings that hold terminal nodes
type SettingPath<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends object
    ? K | `${K}.${SettingPath<T[K]>}`
    : K
  : never;

export type RetroTinkSettingPath = SettingPath<RetroTinkSettingsSchema> | RetroTinkSettingName;

export type RetroTinkSettingsSchema = {
  input: string;
  output: {
    resolution: string;
    transmitter: {
      hdr: string;
      colorimetry: string;
      rgb_range: string;
      sync_lock: string;
      vrr: string;
      deep_color: boolean;
    };
  };
  advanced: {
    effects: {
      scanline: {
        intensity: number;
        thickness: number;
      };
      mask: {
        path: string;
        enabled: boolean;
        strength: number;
      };
    };
    acquisition: {
      audio_input: {
        sampling: {
          sample_rate: string;
        };
        source: {
          input_override: string;
        };
      };
    };
    system: {
      osd_firmware: {
        banner_image: {
          load_banner: string;
        };
        on_screen_display: {
          position: string;
          auto_off: string;
          hide_input_res: boolean;
          enable_debug_osd: string;
        };
      };
    };
  };
};

export const RetroTinkSettingsVersion = {
  '1.4.2': new RetroTinkSettings([
    new RetroTinkReadOnlySetting({
      name: 'header' as RetroTinkSettingName,
      desc: 'File Header (Read-Only)',
      byteRanges: [{ address: 0x0000, length: 12 }],
      type: DataType.STR,
      derivedFrom: [],
      deriveValue: () => new Uint8Array([82, 84, 52, 75, 32, 80, 114, 111, 102, 105, 108, 101]),
    }),
    new RetroTinkSetting({
      name: 'advanced.effects.mask.enabled',
      desc: 'Advanced -> Processing -> Mask -> Enabled',
      byteRanges: [{ address: 0x008c, length: 1 }],
      type: DataType.BIT,
    }),
    new RetroTinkSetting({
      name: 'advanced.effects.mask.strength',
      desc: 'Advanced -> Processing -> Mask -> Strength',
      byteRanges: [{ address: 0x02a0, length: 1 }],
      type: DataType.SIGNED_INT,
    }),
    new RetroTinkSetting({
      name: 'advanced.effects.mask.path',
      desc: 'Advanced -> Processing -> Mask -> Path',
      byteRanges: [{ address: 0x0090, length: 256 }],
      type: DataType.STR,
    }),
    new RetroTinkSetting({
      name: 'advanced.acquisition.audio_input.sampling.sample_rate',
      desc: 'Advanced -> Acquisition -> Audio Input -> Sampling -> Sample Rate',
      byteRanges: [{ address: 0x1624, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: '48 kHz', value: new Uint8Array([0]) },
        { name: '96 kHz', value: new Uint8Array([1]) },
      ],
    }),
    new RetroTinkReadOnlySetting({
      name: 'input.audio' as RetroTinkSettingName,
      desc: 'Audio Input (Read-Only)',
      byteRanges: [{ address: 0x0368, length: 1 }],
      type: DataType.INT,
      derivedFrom: ['advanced.acquisition.audio_input.source.input_override', 'input'],
      deriveValue: (...[audio_input_override, source_input]: RetroTinkSettingValue[]) => {
        const overrideVal = audio_input_override.asInt();
        const sourceVal = source_input.asInt();
        if (overrideVal == 0) {
          switch (sourceVal) {
            case 0:
              return new Uint8Array([5]);
            case 3:
              return new Uint8Array([3]);
            case 4:
              return new Uint8Array([3]);
            case 7:
              return new Uint8Array([0]);
            case 8:
              return new Uint8Array([0]);
            case 9:
              return new Uint8Array([0]);
            case 12:
              return new Uint8Array([2]);
            case 13:
              return new Uint8Array([2]);
            case 14:
              return new Uint8Array([2]);
            case 15:
              return new Uint8Array([2]);
            case 16:
              return new Uint8Array([2]);
            case 17:
              return new Uint8Array([2]);
            case 20:
              return new Uint8Array([1]);
            case 21:
              return new Uint8Array([1]);
            case 22:
              return new Uint8Array([1]);
            case 23:
              return new Uint8Array([1]);
            case 24:
              return new Uint8Array([1]);
            case 25:
              return new Uint8Array([1]);
            case 26:
              return new Uint8Array([1]);
            case 27:
              return new Uint8Array([1]);
          }
        } else {
          return new Uint8Array([overrideVal - 1]);
        }
      },
    }),
    new RetroTinkSetting({
      name: 'advanced.acquisition.audio_input.source.input_override',
      desc: 'Advanced -> Acquisition -> Audio Input -> Source -> Input Override',
      byteRanges: [{ address: 0x1618, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Off', value: new Uint8Array([0]) },
        { name: 'RCA', value: new Uint8Array([1]) },
        { name: 'HD-15', value: new Uint8Array([2]) },
        { name: 'SCART', value: new Uint8Array([3]) },
        { name: 'Front', value: new Uint8Array([4]) },
        { name: 'S/PDIF', value: new Uint8Array([5]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'advanced.system.osd_firmware.banner_image.load_banner',
      desc: 'Advanced -> System -> OSD/Firmware -> On Screen Display -> Load Banner',
      byteRanges: [{ address: 0x1644, length: 256 }],
      type: DataType.STR,
    }),
    new RetroTinkSetting({
      name: 'advanced.system.osd_firmware.on_screen_display.position',
      desc: 'Advanced -> System -> OSD/Firmware -> On Screen Display -> Position',
      byteRanges: [{ address: 0x184c, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Left', value: new Uint8Array([0]) },
        { name: 'Center', value: new Uint8Array([1]) },
        { name: 'Right', value: new Uint8Array([2]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'advanced.system.osd_firmware.on_screen_display.auto_off',
      desc: 'Advanced -> System -> OSD/Firmware -> On Screen Display -> Auto-Off',
      byteRanges: [{ address: 0x1848, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Off', value: new Uint8Array([0]) },
        { name: '10sec', value: new Uint8Array([1]) },
        { name: '20sec', value: new Uint8Array([2]) },
        { name: '30sec', value: new Uint8Array([3]) },
        { name: '40sec', value: new Uint8Array([4]) },
        { name: '50sec', value: new Uint8Array([5]) },
        { name: '60sec', value: new Uint8Array([6]) },
        { name: '70sec', value: new Uint8Array([7]) },
        { name: '80sec', value: new Uint8Array([8]) },
        { name: '90sec', value: new Uint8Array([9]) },
        { name: '100sec', value: new Uint8Array([10]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'advanced.system.osd_firmware.on_screen_display.hide_input_res',
      desc: 'Advanced -> System -> OSD/Firmware -> On Screen Display -> Hide Input Res.',
      byteRanges: [{ address: 0x1ef8, length: 1 }],
      type: DataType.BIT,
    }),
    new RetroTinkSetting({
      name: 'advanced.system.osd_firmware.on_screen_display.enable_debug_osd',
      desc: 'Advanced -> System -> OSD/Firmware -> On Screen Display -> Enable Debug OSD',
      byteRanges: [{ address: 0x1854, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Off', value: new Uint8Array([0]) },
        { name: 'Status Pg 1', value: new Uint8Array([1]) },
        { name: 'Status Pg 2', value: new Uint8Array([2]) },
        { name: 'Status Pg 3', value: new Uint8Array([3]) },
        { name: 'Console', value: new Uint8Array([4]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'input',
      desc: 'Input',
      byteRanges: [{ address: 0x5869, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'HDMI', value: new Uint8Array([0]) },
        { name: 'Front|Composite', value: new Uint8Array([3]) },
        { name: 'Front|S-Video', value: new Uint8Array([4]) },
        { name: 'RCA|YPbPr', value: new Uint8Array([7]) },
        { name: 'RCA|RGsB', value: new Uint8Array([8]) },
        { name: 'RCA|CVBS on Green', value: new Uint8Array([9]) },
        { name: 'SCART|RGBS (75 Ohm)', value: new Uint8Array([12]) },
        { name: 'SCART|RGsB', value: new Uint8Array([13]) },
        { name: 'SCART|YPbPr', value: new Uint8Array([14]) },
        { name: 'SCART|CVBS on Pin 20', value: new Uint8Array([15]) },
        { name: 'SCART|CVBS on Green', value: new Uint8Array([16]) },
        { name: 'SCART|Y/C on Pin 20/Red', value: new Uint8Array([17]) },
        { name: 'HD-15|RGBHV', value: new Uint8Array([20]) },
        { name: 'HD-15|RGBS', value: new Uint8Array([21]) },
        { name: 'HD-15|RGsB', value: new Uint8Array([22]) },
        { name: 'HD-15|YPbPr', value: new Uint8Array([23]) },
        { name: 'HD-15|CVBS on Hsync', value: new Uint8Array([24]) },
        { name: 'HD-15|CVBS on Green', value: new Uint8Array([25]) },
        { name: 'HD-15|Y/C on Green/Red', value: new Uint8Array([26]) },
        { name: 'HD-15|Y/C on G/R (Enh.)', value: new Uint8Array([27]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.resolution',
      desc: 'HDMI Output -> Resolution',
      byteRanges: [{ address: 0x36c, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: '4K60', value: new Uint8Array([0]) },
        { name: '4K50', value: new Uint8Array([1]) },
        { name: '1080p60', value: new Uint8Array([2]) },
        { name: '1080p50', value: new Uint8Array([3]) },
        { name: '1440p60', value: new Uint8Array([4]) },
        { name: '1440p50', value: new Uint8Array([5]) },
        { name: '1080p100', value: new Uint8Array([6]) },
        { name: '1440p100', value: new Uint8Array([7]) },
        { name: '1080p120', value: new Uint8Array([8]) },
        { name: '1440p120', value: new Uint8Array([9]) },
        { name: '480p60', value: new Uint8Array([13]) },
        { name: 'Custom 1', value: new Uint8Array([69]) },
        { name: 'Custom 2', value: new Uint8Array([70]) },
        { name: 'Custom 3', value: new Uint8Array([71]) },
        { name: 'Custom 4', value: new Uint8Array([72]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.transmitter.hdr',
      desc: 'HDMI Output -> Transmitter -> HDR',
      byteRanges: [{ address: 0x2d0, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Off', value: new Uint8Array([0]) },
        { name: 'HDR10 [8-bit]', value: new Uint8Array([1]) },
        { name: 'HLG [8-bit]', value: new Uint8Array([2]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.transmitter.colorimetry',
      desc: 'HDMI Output -> Transmitter -> Colorimetry',
      byteRanges: [{ address: 0x1ec8, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Auto-Rec.709', value: new Uint8Array([0]) },
        { name: 'Rec.709', value: new Uint8Array([1]) },
        { name: 'Rec.2020', value: new Uint8Array([2]) },
        { name: 'Adobe RGB', value: new Uint8Array([3]) },
        { name: 'Display-P3', value: new Uint8Array([4]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.transmitter.rgb_range',
      desc: 'HDMI Output -> Transmitter -> RGB Range',
      byteRanges: [{ address: 0x1f08, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Full', value: new Uint8Array([0]) },
        { name: 'Limited', value: new Uint8Array([1]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.transmitter.sync_lock',
      desc: 'HDMI Output -> Transmitter -> Sync Lock',
      byteRanges: [{ address: 0x2d8, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Triple Buffer', value: new Uint8Array([0]) },
        { name: 'Gen Lock', value: new Uint8Array([1]) },
        { name: 'Frame Lock', value: new Uint8Array([2]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.transmitter.vrr',
      desc: 'HDMI Output -> Transmitter -> VRR',
      byteRanges: [{ address: 0x2dc, length: 1 }],
      type: DataType.ENUM,
      enums: [
        { name: 'Off', value: new Uint8Array([0]) },
        { name: 'FreeSync', value: new Uint8Array([1]) },
        { name: 'VESA', value: new Uint8Array([2]) },
      ],
    }),
    new RetroTinkSetting({
      name: 'output.transmitter.deep_color',
      desc: 'HDMI Output -> Transmitter -> Deep Color',
      byteRanges: [{ address: 0x2d4, length: 1 }],
      type: DataType.BIT,
    }),
  ]),
};
