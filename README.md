# rt4k-profile ૮₍ • ˕ - ₎ა
[![npm version](https://badge.fury.io/js/rt4k-profile.svg)](https://badge.fury.io/js/rt4k-profile) [![codecov](https://codecov.io/github/boatmeme/rt4k-profile/graph/badge.svg?token=dbwq3YlYw2)](https://codecov.io/github/boatmeme/rt4k-profile) ![build](https://github.com/boatmeme/rt4k-profile/actions/workflows/coverage.yml/badge.svg?branch=main)

A Typescript Library for Reading and Writing RetroTINK-4k .rt4 Profiles

## Overview

The [RetroTINK-4k](https://www.retrotink.com/product-page/retrotink-4k) is a video scaler primarily intended for processing signals from retro gaming consoles, enabling display at 4K resolution while maintaining an authentic visual experience. 

It features a well-designed, on-screen menu for manipulating settings and a profile system for persisting configurations of parameters such as input type, color settings, and resolution preferences, allowing users to tweak, save and apply them for consistent performance on their equipment, across different consoles.

The profiles are stored on an SD Card and can be copied, renamed and organized on a computer, but they are stored in a binary format that isn't easily editable by hand. This means that - as nice as the remote control and on-screen menus are - it can be tedious to, for instance, apply a specific set of CRT scanline / mask settings to a large set of pre-existing profiles.

`rt4k-profile` was built to fill that need, providing a convenient API for programmatically manipulating RetroTINK-4k profiles. Although it is a work-in-progress, it is designed to be immediately functional and is under continuous development to support more settings.

---
## Prerequisites

- NodeJS >= 14.15

## Install

```
npm install rt4k-profile
```

## Usage

```typescript
import { RetroTinkProfile } from 'rt4k-profile';

// Load the "default" profile, asynchronously
const profile = await RetroTinkProfile.build();

// Load the "default" profile, synchronously
const profileSync = RetroTinkProfile.buildSync();

// Print a list of the currently supported profile settings
const settingsNames = profile.getSettingsNames();
console.log(settingsNames);

// Print a (pretty) JSON representation of the Profile Settings' values
const prettyJSON = profile.serializeValues(true);
console.log(prettyJSON);

// Print a list of the valid values for the `input` setting
console.log(RetroTinkProfile.get('input').validValues());
```

### There are several different approaches you can use for manipulating settings...
  
```typescript
// Set the `input` setting to "SCART|RGBS (75 Ohm)" using the setting.path / value interface
profile.setValue('input', 'SCART|RGBS (75 Ohm)')

// Set the `output.resolution` setting by mutating a RetroTinkSettingValue object, and setting it on the Profile
const outputResolutionSetting = profile.getValue('output.resolution');
outputResolutionSetting.set('1440p120');
profile.setValue(outputResolutionSetting)

// Set the `output.transmitter.deep_color` setting using a Plain Javascript Object
profile.setValue({ output: { transmitter: { deep_color: true } } })
```

### Now, putting it all together, let's remix some profiles.
  
```typescript
// Load my existing "target" profile, asynchronously
const targetProfile = await RetroTinkProfile.build('/path/to/my/snes_profile.rt4');

// Load a profile with a great set of CRT scanlines/mask settings I found online
const scanlinesProfile = await RetroTinkProfile.build('/path/to/other/crt-scanlines.rt4');

// Some ad-hoc settings, I'm going to add with the others
const myCustomSetting = { input: 'Front|S-Video' }

// Grab all of the values underneath the path of `advanced.effects` from the scanlinesProfile
// Set my own `input` setting
const outputProfile = targetProfile.merge(scanlinesProfile.getValues('advanced.effects'), myCustomSetting);

// Now, lets write the merged profile to disk
await outputProfile.save('/path/to/my/new_snes_profile.rt4');

// or, synchronously
outputProfile.saveSync('/path/to/my/new_snes_profile.rt4');
```

### See [`./examples`](./examples) for more

## API Documentation

[**TODO**]

## Roadmap 

[**TODO**]

## Changelog 

### Version 0.1.0 (2024-06-29)

- Initial release
- Added support for the following settings:
  - `advanced.effects.mask.enabled`
  - `advanced.effects.mask.strength`
  - `advanced.effects.mask.path`
  - `input`
  - `output.resolution`
  - `output.transmitter.hdr`
  - `output.transmitter.colorimetry`
  - `output.transmitter.rgb_range`
  - `output.transmitter.sync_lock`
  - `output.transmitter.vrr`
  - `output.transmitter.deep_color`

## Contributing

Right now, this is the side-project of a single developer and I'm limited to the amount of time I can spend reverse engineering the binary .rt4 profile format. Feel free to open an issue requesting specific settings, or better yet, contribute directly:

1. Fork repo
2. Add / modify tests
3. Add / modify implementation
4. Open PR
  * (Optional) link to your development soundtrack

## License

The MIT License (MIT)

Copyright (c) 2024 Jonathan Griggs

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Soundtrack

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/vYxR1WZ5HbY/0.jpg)](https://www.youtube.com/watch?v=vYxR1WZ5HbY)