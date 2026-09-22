export {};

declare global {
  namespace JSX {
    type Element = HTMLElement | DocumentFragment;
    type ElementType = string | symbol | ((props: any) => any);

    interface ElementChildrenAttribute {
      children: {};
    }

    interface HTMLAttributes {
      id?: string;
      class?: string;
      className?: string;
      style?: string | Record<string, string | number>;
      children?: any;
      [key: string]: any;
    }

    interface DOMAttributes extends HTMLAttributes {
      onClick?: (e: MouseEvent) => void;
      onInput?: (e: InputEvent) => void;
      onChange?: (e: Event) => void;
      onSubmit?: (e: SubmitEvent) => void;
    }

    interface IntrinsicElements {
      [elemName: string]: DOMAttributes;
    }
  }
}

declare module "@zephyr/core" {
  export namespace JSX {
    type Element = globalThis.JSX.Element;
    type ElementType = globalThis.JSX.ElementType;
    type ElementChildrenAttribute = globalThis.JSX.ElementChildrenAttribute;
    type HTMLAttributes = globalThis.JSX.HTMLAttributes;
    type DOMAttributes = globalThis.JSX.DOMAttributes;
    type IntrinsicElements = globalThis.JSX.IntrinsicElements;
  }
}

declare module "@zephyr/core/jsx-runtime" {
  export namespace JSX {
    type Element = globalThis.JSX.Element;
    type ElementType = globalThis.JSX.ElementType;
    type ElementChildrenAttribute = globalThis.JSX.ElementChildrenAttribute;
    type HTMLAttributes = globalThis.JSX.HTMLAttributes;
    type DOMAttributes = globalThis.JSX.DOMAttributes;
    type IntrinsicElements = globalThis.JSX.IntrinsicElements;
  }
}