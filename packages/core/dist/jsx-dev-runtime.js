// src/index.ts
var activeEffect = null;
var effectStack = [];
function cleanup(effectFn) {
  if (effectFn.deps) {
    for (const subs of effectFn.deps) {
      subs.delete(effectFn);
    }
    effectFn.deps.clear();
  }
}
function effect(fn) {
  const execute = () => {
    cleanup(execute);
    effectStack.push(execute);
    activeEffect = execute;
    try {
      fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1] || null;
    }
  };
  execute.deps = /* @__PURE__ */ new Set();
  execute();
}
var ReactiveNode = class {
  __getter;
  _value;
  constructor(getter, value) {
    this.__getter = getter;
    this._value = value;
  }
  toString() {
    return String(this._value);
  }
  valueOf() {
    return this._value;
  }
};
var Fragment = /* @__PURE__ */ Symbol("fluxonjs.Fragment");
function appendChildren(parent, children) {
  children.flat().forEach((child) => {
    if (child === null || child === void 0 || typeof child === "boolean") return;
    if (child instanceof ReactiveNode) {
      const textNode = document.createTextNode("");
      parent.appendChild(textNode);
      const signalGetter = child.__getter;
      effect(() => {
        const val = signalGetter();
        textNode.nodeValue = val === null || val === void 0 || typeof val === "boolean" ? "" : String(val);
      });
    } else if (typeof child === "function") {
      if (child.__isSignalGetter) {
        console.warn(
          "[FluxonJS] Kh\xF4ng \u0111\u01B0\u1EE3c truy\u1EC1n th\u1EB3ng signal. H\xE3y d\xF9ng count() ho\u1EB7c () => count()"
        );
        return;
      }
      const textNode = document.createTextNode("");
      parent.appendChild(textNode);
      effect(() => {
        const val = child();
        textNode.nodeValue = val === null || val === void 0 || typeof val === "boolean" ? "" : String(val);
      });
    } else if (Array.isArray(child)) {
      appendChildren(parent, child);
    } else if (child instanceof Node) {
      parent.appendChild(child);
    } else {
      parent.appendChild(document.createTextNode(String(child)));
    }
  });
}
function fluxonjs(tag, props, ...children) {
  const normalizedProps = props || {};
  const {
    children: propsChildren,
    __source,
    __self,
    key,
    ...restProps
  } = normalizedProps;
  let rawChildren = [];
  if (children.length > 0) {
    rawChildren = children.flat();
  } else if (propsChildren !== void 0) {
    rawChildren = Array.isArray(propsChildren) ? propsChildren.flat() : [propsChildren];
  }
  if (tag === Fragment) {
    const docFragment = document.createDocumentFragment();
    appendChildren(docFragment, rawChildren);
    return docFragment;
  }
  if (typeof tag === "function") {
    return tag({ ...restProps, children: rawChildren });
  }
  const element = document.createElement(tag);
  Object.keys(restProps).forEach((propKey) => {
    const value = restProps[propKey];
    if (propKey.startsWith("on") && typeof value === "function") {
      const eventName = propKey.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else if (typeof value === "function") {
      effect(() => {
        const currentVal = value();
        if (propKey in element) {
          element[propKey] = currentVal;
        } else {
          element.setAttribute(propKey, String(currentVal));
        }
      });
    } else if (value instanceof ReactiveNode) {
      const getter = value.__getter;
      effect(() => {
        const currentVal = getter();
        if (propKey in element) {
          element[propKey] = currentVal;
        } else {
          element.setAttribute(propKey, String(currentVal));
        }
      });
    } else if (propKey in element) {
      element[propKey] = value;
    } else {
      element.setAttribute(propKey, value);
    }
  });
  appendChildren(element, rawChildren);
  return element;
}

// src/jsx-dev-runtime.ts
function jsxDEV(type, props, key, isStatic, source, self) {
  const finalProps = props || {};
  if (key !== void 0) {
    finalProps.key = key;
  }
  return fluxonjs(type, finalProps);
}
var jsx = jsxDEV;
var jsxs = jsxDEV;
var Fragment2 = Fragment;
export {
  Fragment2 as Fragment,
  jsx,
  jsxDEV,
  jsxs
};
//# sourceMappingURL=jsx-dev-runtime.js.map