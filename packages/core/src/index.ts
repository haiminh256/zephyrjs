/// <reference path="./jsx-runtime.d.ts" />
export * from "./jsx-runtime";

type EffectFn = (() => void) & {
  deps?: Set<Set<EffectFn>>;
};
type Setter<T> = (newValue: T | ((prev: T) => T)) => void;
type Getter<T> = () => T;

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

export function signal<T>(initialValue: T): [Getter<T>, Setter<T>] {
  let value = initialValue;
  const subscribers = new Set<EffectFn>();

  const getter: Getter<T> = () => {
    if (activeEffect) {
      subscribers.add(activeEffect);
      activeEffect.deps?.add(subscribers);
    }
    return value;
  };

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
    if (child === null || child === undefined || child === false) return;

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

export function fluxonjs(
  tag: string | Function | symbol,
  props: Record<string, any> | null,
  ...children: any[]
): HTMLElement | DocumentFragment {
  if (tag === Fragment) {
    const docFragment = document.createDocumentFragment();
    appendChildren(docFragment, children);
    return docFragment;
  }

  if (typeof tag === "function") {
    const mergedProps = { ...props, children: children.flat() };
    return tag(mergedProps);
  }

  const element = document.createElement(tag as string);

  if (props) {
    Object.keys(props).forEach((key) => {
      if (key === "children") return;

      const value = props[key];

      if (key.startsWith("on") && typeof value === "function") {
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value);
      } 
      else if (typeof value === "function") {
        effect(() => {
          const currentVal = value();
          if (key in element) {
            (element as any)[key] = currentVal;
          } else {
            element.setAttribute(key, String(currentVal));
          }
        });
      } 
      else if (key in element) {
        (element as any)[key] = value;
      } else {
        element.setAttribute(key, value);
      }
    });
  }

  appendChildren(element, children);

  return element;
}

export const jsx = { createElement: fluxonjs };

export function render(component: () => HTMLElement, container: HTMLElement) {
  container.innerHTML = "";
  container.appendChild(component());
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
    const renderFn = typeof props.children === "function" 
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