export namespace JSX {
  export type Element = HTMLElement | DocumentFragment | Node;
  export type ElementType = string | symbol | ((props: any) => any);

  export interface ElementChildrenAttribute {
    children: {};
  }

  export interface HTMLAttributes {
    id?: string;
    class?: string;
    className?: string;
    style?: string | Record<string, string | number>;
    ref?: { current?: Node | null } | ((el: Node) => void);
    children?: any;
    [key: string]: any;
  }

  export interface DOMAttributes extends HTMLAttributes {
    onClick?: (e: MouseEvent & { currentTarget: HTMLElement }) => void;
    onInput?: (e: InputEvent & { target: HTMLInputElement | HTMLTextAreaElement }) => void;
    onChange?: (e: Event & { target: HTMLInputElement | HTMLSelectElement }) => void;
    onSubmit?: (e: SubmitEvent & { currentTarget: HTMLFormElement }) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    onKeyUp?: (e: KeyboardEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
  }

  export interface IntrinsicElements {
    [elemName: string]: DOMAttributes;
  }
}