// packages/core/src/jsx-runtime.ts
import { fluxonjs, Fragment  } from "./index";

function jsx(type: any, props: any, key?: any) {
  const finalProps = props || {};
  if (key !== undefined) {
    finalProps.key = key;
  }
  return fluxonjs(type, finalProps);
}

const jsxs = jsx;

export { jsx, jsxs, Fragment };