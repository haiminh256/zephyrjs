import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxFactory: "fluxonjs",
    jsxFragment: "Fragment",
    jsxInject: `import { fluxonjs, Fragment } from "@fluxonjs/core"`,
  },
  resolve: {
    alias: {
      "@fluxonjs/core": path.resolve(import.meta.dirname, "../packages/core/src/index.ts"),
      "@fluxonjs/router": path.resolve(import.meta.dirname, "../packages/router/src/index.ts"),
    },
    dedupe: ["@fluxonjs/core", "@fluxonjs/router"],
  },
  optimizeDeps: {
    exclude: ["@fluxonjs/core", "@fluxonjs/router"],
  },
});