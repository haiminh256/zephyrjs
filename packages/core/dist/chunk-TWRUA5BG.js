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
function signal(initialValue) {
  let value = initialValue;
  const subscribers = /* @__PURE__ */ new Set();
  const getter = () => {
    if (activeEffect) {
      subscribers.add(activeEffect);
      activeEffect.deps?.add(subscribers);
    }
    return value;
  };
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
var Fragment = /* @__PURE__ */ Symbol("Zephyr.Fragment");
function appendChildren(parent, children) {
  children.flat().forEach((child) => {
    if (child === null || child === void 0 || child === false) return;
    if (typeof child === "function") {
      const textNode = document.createTextNode("");
      parent.appendChild(textNode);
      effect(() => {
        textNode.nodeValue = String(child());
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
function Zephyr(tag, props, ...children) {
  if (tag === Fragment) {
    const docFragment = document.createDocumentFragment();
    appendChildren(docFragment, children);
    return docFragment;
  }
  if (typeof tag === "function") {
    const mergedProps = { ...props, children: children.flat() };
    return tag(mergedProps);
  }
  const element = document.createElement(tag);
  if (props) {
    Object.keys(props).forEach((key) => {
      if (key === "children") return;
      const value = props[key];
      if (key.startsWith("on") && typeof value === "function") {
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else if (typeof value === "function") {
        effect(() => {
          const currentVal = value();
          if (key in element) {
            element[key] = currentVal;
          } else {
            element.setAttribute(key, String(currentVal));
          }
        });
      } else if (key in element) {
        element[key] = value;
      } else {
        element.setAttribute(key, value);
      }
    });
  }
  appendChildren(element, children);
  return element;
}
var jsx = { createElement: Zephyr };
function render(component, container) {
  container.innerHTML = "";
  container.appendChild(component());
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

// src/jsx-runtime.ts
function jsx2(tag, props) {
  const { children, ...restProps } = props || {};
  let finalChildren = children;
  if (typeof children !== "function" && children !== void 0) {
    finalChildren = Array.isArray(children) ? children : [children];
  } else if (children === void 0) {
    finalChildren = [];
  }
  return Zephyr(tag, restProps, ...Array.isArray(finalChildren) ? finalChildren : [finalChildren]);
}

export {
  jsx2 as jsx,
  effect,
  signal,
  memo,
  callback,
  Fragment,
  Zephyr,
  jsx as jsx2,
  render,
  For
};
//# sourceMappingURL=chunk-TWRUA5BG.js.map