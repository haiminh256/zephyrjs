type Reactive<T> = T | (() => T);
type IfEquals<X, Y, A, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;
type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<{
        [Q in P]: T[P];
    }, {
        -readonly [Q in P]: T[P];
    }, P>;
}[keyof T];
type PropKeys<T> = Extract<Exclude<WritableKeys<T>, `on${string}` | "style">, keyof T & string>;
type DomProps<T> = {
    [K in PropKeys<T> as T[K] extends (...args: any[]) => any ? never : K]?: Reactive<T[K]>;
};
type CamelEventMap = {
    onClick: "click";
    onDblClick: "dblclick";
    onInput: "input";
    onChange: "change";
    onSubmit: "submit";
    onKeyDown: "keydown";
    onKeyUp: "keyup";
    onFocus: "focus";
    onBlur: "blur";
    onMouseDown: "mousedown";
    onMouseUp: "mouseup";
    onMouseMove: "mousemove";
    onMouseEnter: "mouseenter";
    onMouseLeave: "mouseleave";
    onPointerDown: "pointerdown";
    onPointerUp: "pointerup";
    onScroll: "scroll";
};
type Events<T> = {
    [K in keyof CamelEventMap]?: (e: HTMLElementEventMap[CamelEventMap[K]] & {
        currentTarget: T;
    }) => void;
} & {
    [k: `on${string}`]: ((e: any) => void) | undefined;
};
interface BaseProps {
    class?: Reactive<string>;
    style?: Reactive<string>;
    key?: string | number;
    children?: any;
    [attr: `data-${string}`]: any;
    [attr: `aria-${string}`]: any;
}
type ElProps<T> = DomProps<T> & Events<T> & BaseProps;
type HtmlIntrinsics = {
    [K in keyof HTMLElementTagNameMap]: ElProps<HTMLElementTagNameMap[K]>;
};
export declare namespace JSX {
    type Element = HTMLElement | DocumentFragment | Node;
    type ElementType = string | symbol | ((props: any) => any);
    interface ElementChildrenAttribute {
        children: {};
    }
    interface IntrinsicAttributes {
        key?: string | number;
    }
    interface IntrinsicElements extends HtmlIntrinsics {
        [tag: `${string}-${string}`]: ElProps<HTMLElement>;
    }
}
export {};
//# sourceMappingURL=jsx.d.ts.map