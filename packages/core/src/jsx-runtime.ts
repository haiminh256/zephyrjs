import { quantum-js, Fragment } from "./index";

export function jsx(tag: any, props: any) {
  const { children, ...restProps } = props || {};

  let finalChildren = children;
  if (typeof children !== "function" && children !== undefined) {
    finalChildren = Array.isArray(children) ? children : [children];
  } else if (children === undefined) {
    finalChildren = [];
  }

  return quantum-js(tag, restProps, ...(Array.isArray(finalChildren) ? finalChildren : [finalChildren]));
}

export { jsx as jsxs, Fragment };