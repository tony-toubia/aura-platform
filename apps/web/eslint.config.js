// eslint.config.js
import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...nextJsConfig,
  // our Node-env override for config files
  {
    files: [
      "next.config.js",
      "tailwind.config.cjs",
      "postcss.config.mjs",
    ],
    languageOptions: {
      globals: {
        process: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off", // allow CJS in tailwind.config
    },
  },
];

export default config;
