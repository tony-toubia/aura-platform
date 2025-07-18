// eslint.config.js
import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
const config = {
  ...nextJsConfig,
  overrides: [
    // preserve any existing overrides
    ...(nextJsConfig.overrides ?? []),

    // our Node-env override for config files
    {
      files: [
        "apps/web/next.config.js",
        "apps/web/tailwind.config.cjs",
        "apps/web/postcss.config.mjs",
      ],
      env: {
        node: true, // allows `process`, `module`, etc.
      },
      rules: {
        "@typescript-eslint/no-require-imports": "off", // allow CJS in tailwind.config
      },
    },
  ],
};

export default config;
