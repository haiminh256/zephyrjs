import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxInject: `import { fluxonjs, Fragment } from '@fluxonjs/core'`
  }
});