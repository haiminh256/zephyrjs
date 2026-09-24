import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "@fluxonjs/core",
  },
  resolve: {
    dedupe: ["@fluxonjs/core"],
  },
  optimizeDeps: {
    exclude: ["@fluxonjs/core"],
  },
});