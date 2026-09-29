import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxFactory: "fluxonjs",
    jsxFragment: "Fragment",
    jsxInject: `import { fluxonjs, Fragment } from "@fluxonjs/core"`,
  },
  resolve: {
    dedupe: ["@fluxonjs/core"],
  },
  optimizeDeps: {
    exclude: ["@fluxonjs/core"],
  },
});