export * from "./jsx-runtime";

type EffectFn = (() => void) & {
  deps?: Set<Set<EffectFn>>;
};

type Setter<T> = (newValue: T | ((prev: T) => T)) => void;
type Getter<T> = () => T;

export interface SignalGetter<T> {
  (): T;
  __isSignalGetter?: boolean;
}

interface ForProps<T> {
  each: () => T[];
  children: ((item: T, index: () => number) => HTMLElement | DocumentFragment) | any;
}

let activeEffect: EffectFn | null = null;
const effectStack: EffectFn[] = [];

function cleanup(effectFn: EffectFn) {
  if (effectFn.deps) {
    for (const subs of effectFn.deps) {
      subs.delete(effectFn);
    }
    effectFn.deps.clear();
  }
}

export function effect(fn: () => void): void {
  const execute: EffectFn = () => {
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
  execute.deps = new Set();
  execute();
}

class ReactiveNode {
  public __getter: () => any;
  private _value: any;

  constructor(getter: () => any, value: any) {
    this.__getter = getter;
    this._value = value;
  }
  toString() {
    return String(this._value);
  }

  valueOf() {
    return this._value;
  }
}

export function signal<T>(initialValue: T): [SignalGetter<T>, Setter<T>] {
  let value = initialValue;
  const subscribers = new Set<EffectFn>();

  const getter: SignalGetter<T> = () => {
    if (activeEffect) {
      subscribers.add(activeEffect);
      activeEffect.deps?.add(subscribers);
    }

    if (!activeEffect) {
      return new ReactiveNode(getter, value) as any;
    }

    return value;
  };

  getter.__isSignalGetter = true;

  const setter: Setter<T> = (newValue) => {
    const nextValue =
      typeof newValue === "function"
        ? (newValue as (prev: T) => T)(value)
        : newValue;

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

export function memo<T>(fn: () => T): Getter<T> {
  const [value, setValue] = signal<T>(undefined as T);
  effect(() => {
    setValue(fn());
  });
  return value;
}

export function callback<Args extends any[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R {
  return (...args: Args) => {
    return fn(...args);
  };
}

export const Fragment = Symbol("fluxonjs.Fragment");

function appendChildren(parent: Node, children: any[]) {
  children.flat().forEach((child) => {
    if (child === null || child === undefined || typeof child === "boolean") return;
    if (child instanceof ReactiveNode) {
      const textNode = document.createTextNode("");
      parent.appendChild(textNode);

      const signalGetter = child.__getter;
      effect(() => {
        const val = signalGetter();
        textNode.nodeValue =
          val === null || val === undefined || typeof val === "boolean"
            ? ""
            : String(val);
      });
    }
    else if (typeof child === "function") {
      if ((child as any).__isSignalGetter) {
        console.warn(
          "[FluxonJS] Không được truyền thẳng signal. Hãy dùng count() hoặc () => count()"
        );
        return;
      }

      const textNode = document.createTextNode("");
      parent.appendChild(textNode);

      effect(() => {
        const val = child();
        textNode.nodeValue =
          val === null || val === undefined || typeof val === "boolean"
            ? ""
            : String(val);
      });
    }
    else if (Array.isArray(child)) {
      appendChildren(parent, child);
    }
    else if (child instanceof Node) {
      parent.appendChild(child);
    }
    else {
      parent.appendChild(document.createTextNode(String(child)));
    }
  });
}

export function fluxonjs(
  tag: string | Function | symbol,
  props: Record<string, any> | null,
  ...children: any[]
): Node {
  const normalizedProps = props || {};
  const {
    children: propsChildren,
    __source,
    __self,
    key,
    ...restProps
  } = normalizedProps;

  let rawChildren: any[] = [];
  if (children.length > 0) {
    rawChildren = children.flat();
  } else if (propsChildren !== undefined) {
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

  const element = document.createElement(tag as string);

  Object.keys(restProps).forEach((propKey) => {
    const value = restProps[propKey];

    if (propKey.startsWith("on") && typeof value === "function") {
      const eventName = propKey.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
    }
    else if (typeof value === "function") {
      effect(() => {
        const currentVal = value();
        if (propKey in element) {
          (element as any)[propKey] = currentVal;
        } else {
          element.setAttribute(propKey, String(currentVal));
        }
      });
    } else if (value instanceof ReactiveNode) {
      const getter = value.__getter;
      effect(() => {
        const currentVal = getter();
        if (propKey in element) {
          (element as any)[propKey] = currentVal;
        } else {
          element.setAttribute(propKey, String(currentVal));
        }
      });
    }
    else if (propKey in element) {
      (element as any)[propKey] = value;
    } else {
      element.setAttribute(propKey, value);
    }
  });

  appendChildren(element, rawChildren);
  return element;
}

export const jsx = { createElement: fluxonjs };

export function render(
  code: Element | DocumentFragment | (() => Element | DocumentFragment | Node),
  container: HTMLElement
): void {
  const node = typeof code === "function" ? code() : code;
  container.appendChild(node);
}

export function For<T>(props: ForProps<T>): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const startMarker = document.createComment("for-start");
  const endMarker = document.createComment("for-end");
  fragment.appendChild(startMarker);
  fragment.appendChild(endMarker);

  let renderedNodes: Node[] = [];

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

    const renderFn =
      typeof props.children === "function"
        ? props.children
        : Array.isArray(props.children) && typeof props.children[0] === "function"
        ? props.children[0]
        : null;

    if (!renderFn) {
      console.error("<For> yêu cầu children phải là một Function dạng: (item) => JSX");
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