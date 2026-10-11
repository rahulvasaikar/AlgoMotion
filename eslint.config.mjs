import { config } from "@remotion/eslint-config-flat";

export default [
  ...config,
  {
    rules: {
      "@remotion/valid-composition-and-folder-name": "off",
    },
  },
  {
    files: ["src/ui/**"],
    rules: {
      "@remotion/non-pure-animation": "off",
      "@remotion/warn-native-media-tag": "off",
      "@remotion/deterministic-randomness": "off",
    },
  },
];
