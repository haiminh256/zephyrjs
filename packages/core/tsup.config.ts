// packages/core/tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "jsx-runtime": "src/jsx-runtime.ts",
    "jsx-dev-runtime": "src/jsx-dev-runtime.ts",
  },
  format: ["esm"],
  dts: false,
  clean: true,
  sourcemap: true,
  tsconfig: "tsconfig.json",
});