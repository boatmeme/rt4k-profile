export const unpretty_json_str = `{"header":"RT4K Profile","advanced":{"effects":{"mask":{"enabled":true,"strength":-4,"path":"Mono Masks/A Grille Medium Mono.bmp"}}}}`;
export const pretty_json_str = `{
  "header": "RT4K Profile",
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
  }
}`;