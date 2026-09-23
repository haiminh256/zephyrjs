export {};

declare global {
  namespace JSX {
    type Element = HTMLElement | DocumentFragment | Node;
    type ElementType = string | symbol | ((props: any) => any);

    interface ElementChildrenAttribute {
      children: {};
    }

    interface HTMLAttributes {
      id?: string;
      class?: string;
      className?: string;
      style?: string | Record<string, string | number>;
      ref?: { current?: Node | null } | ((el: Node) => void);
      children?: any;
      [key: string]: any;
    }

    interface DOMAttributes extends HTMLAttributes {
      onClick?: (e: MouseEvent & { currentTarget: HTMLElement }) => void;
      onInput?: (e: InputEvent & { target: HTMLInputElement | HTMLTextAreaElement }) => void;
      onChange?: (e: Event & { target: HTMLInputElement | HTMLSelectElement }) => void;
      onSubmit?: (e: SubmitEvent & { currentTarget: HTMLFormElement }) => void;
      onKeyDown?: (e: KeyboardEvent) => void;
      onKeyUp?: (e: KeyboardEvent) => void;
      onFocus?: (e: FocusEvent) => void;
      onBlur?: (e: FocusEvent) => void;
    }
    interface IntrinsicElements {
      [elemName: string]: DOMAttributes;
    }
  }
}