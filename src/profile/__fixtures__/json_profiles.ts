export const unpretty_json_str = `{"advanced":{"effects":{"mask":{"enabled":true,"strength":-4,"path":"Mono Masks/A Grille Medium Mono.bmp"}},"acquisition":{"audio_input":{"sampling":{"sample_rate":"48 kHz","preamp_gain":"+0.0 dB"},"source":{"input_override":"Off","input_swap":"Off"}}},"system":{"osd_firmware":{"banner_image":{"load_banner":""},"on_screen_display":{"position":"Left","auto_off":"Off","hide_input_res":false,"enable_debug_osd":"Off"}}}},"input":"HDMI","output":{"resolution":"4K60","transmitter":{"hdr":"Off","colorimetry":"Auto-Rec.709","rgb_range":"Full","sync_lock":"Triple Buffer","vrr":"Off","deep_color":false}}}`;
export const pretty_json_str = `{
  "advanced": {
    "effects": {
      "mask": {
        "enabled": true,
        "strength": -4,
        "path": "Mono Masks/A Grille Medium Mono.bmp"
      }
    },
    "acquisition": {
      "audio_input": {
        "sampling": {
          "sample_rate": "48 kHz",
          "preamp_gain": "+0.0 dB"
        },
        "source": {
          "input_override": "Off",
          "input_swap": "Off"
        }
      }
    },
    "system": {
      "osd_firmware": {
        "banner_image": {
          "load_banner": ""
        },
        "on_screen_display": {
          "position": "Left",
          "auto_off": "Off",
          "hide_input_res": false,
          "enable_debug_osd": "Off"
        }
      }
    }
  },
  "input": "HDMI",
  "output": {
    "resolution": "4K60",
    "transmitter": {
      "hdr": "Off",
      "colorimetry": "Auto-Rec.709",
      "rgb_range": "Full",
      "sync_lock": "Triple Buffer",
      "vrr": "Off",
      "deep_color": false
    }
  }
}`;
export const invalid_json = `{
  "header": RT4K Profile,
  "advanced": {
    "effects": {
      "mask": {
        "enabled": true,
        "strength": -4,
        "path": "Mono Masks/A Grille Medium Mono.bmp"
      }
    }
  }
}`;
export const bad_setting_json_str = `{
  "header": "RT4K Profile",
  "advanced": {
    "effects": {
      "mask": {
        "enabled": true,
        "strength": -4,
        "a_bad_setting": false,
        "path": "Mono Masks/A Grille Medium Mono.bmp"
      }
    }
  },
  "input": "HDMI"
}`;
