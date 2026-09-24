// src/jsx-runtime.ts
function jsx(type, props, key) {
  const finalProps = props || {};
  if (key !== void 0) {
    finalProps.key = key;
  }
  return fluxonjs(type, finalProps);
}
var jsxs = jsx;

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
function signal(initialValue) {
  let value = initialValue;
  const subscribers = /* @__PURE__ */ new Set();
  const getter = () => {
    if (activeEffect) {
      subscribers.add(activeEffect);
      activeEffect.deps?.add(subscribers);
    }
    if (!activeEffect) {
      return new ReactiveNode(getter, value);
    }
    return value;
  };
  getter.__isSignalGetter = true;
  const setter = (newValue) => {
    const nextValue = typeof newValue === "function" ? newValue(value) : newValue;
    if (value !== nextValue) {
      value = nextValue;
      const subsToRun = Array.from(subscribers);
      subsToRun.forEach((fn) => {
        if (fn !== activeEffect) {
          fn();
        }
      });
    }
  };
  return [getter, setter];
}
function memo(fn) {
  const [value, setValue] = signal(void 0);
  effect(() => {
    setValue(fn());
  });
  return value;
}
function callback(fn) {
  return (...args) => {
    return fn(...args);
  };
}
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
var jsx2 = { createElement: fluxonjs };
function render(code, container) {
  const node = typeof code === "function" ? code() : code;
  container.appendChild(node);
}
function For(props) {
  const fragment = document.createDocumentFragment();
  const startMarker = document.createComment("for-start");
  const endMarker = document.createComment("for-end");
  fragment.appendChild(startMarker);
  fragment.appendChild(endMarker);
  let renderedNodes = [];
  effect(() => {
    const list = props.each() || [];
    const parent = startMarker.parentNode;
    if (!parent) return;
    renderedNodes.forEach((node) => {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
    renderedNodes = [];
    const renderFn = typeof props.children === "function" ? props.children : Array.isArray(props.children) && typeof props.children[0] === "function" ? props.children[0] : null;
    if (!renderFn) {
      console.error("<For> y\xEAu c\u1EA7u children ph\u1EA3i l\xE0 m\u1ED9t Function d\u1EA1ng: (item) => JSX");
      return;
    }
    const newFragment = document.createDocumentFragment();
    list.forEach((item, idx) => {
      const indexGetter = () => idx;
      const element = renderFn(item, indexGetter);
      if (element instanceof DocumentFragment) {
        const childrenArray = Array.from(element.childNodes);
        renderedNodes.push(...childrenArray);
        newFragment.appendChild(element);
      } else if (element instanceof Node) {
        renderedNodes.push(element);
        newFragment.appendChild(element);
      }
    });
    parent.insertBefore(newFragment, endMarker);
  });
  return fragment;
}
export {
  For,
  Fragment,
  callback,
  effect,
  fluxonjs,
  jsx2 as jsx,
  jsxs,
  memo,
  render,
  signal
};
//# sourceMappingURL=index.js.map