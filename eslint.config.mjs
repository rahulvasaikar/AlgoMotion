import { config } from "@remotion/eslint-config-flat";

export default [
  ...config,
  {
    rules: {
      "@remotion/valid-composition-and-folder-name": "off",
    },
  },
];
