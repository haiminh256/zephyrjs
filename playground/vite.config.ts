import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxInject: `import { Zephyr, Fragment } from '@zephyr/core'`
  }
});