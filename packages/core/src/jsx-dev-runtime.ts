// packages/core/src/jsx-dev-runtime.ts
import { fluxonjs, Fragment as InternalFragment } from "./index";

export function jsxDEV(type: any, props: any, key: any, isStatic?: boolean, source?: any, self?: any) {
  const finalProps = props || {};
  if (key !== undefined) {
    finalProps.key = key;
  }
  

  return fluxonjs(type, finalProps);
}

export const jsx = jsxDEV;
export const jsxs = jsxDEV;
export const Fragment = InternalFragment;