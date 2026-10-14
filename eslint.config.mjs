import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Throwaway CommonJS probes for third-party APIs, run by hand with `node`. They are
    // already untracked (see .gitignore's `test_*.js`) and are not part of the app, so
    // linting them as app source only produces noise about `require()`.
    "test-*.js",
    "test_*.js",
  ]),
]);

export default eslintConfig;
