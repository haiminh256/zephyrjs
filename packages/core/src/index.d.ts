export * from "./jsx-runtime";
type Setter<T> = (newValue: T | ((prev: T) => T)) => void;
type Getter<T> = () => T;
interface ForProps<T> {
    each: () => T[];
    children: ((item: T, index: () => number) => HTMLElement | DocumentFragment) | any;
}
export declare function effect(fn: () => void): void;
export declare function signal<T>(initialValue: T): [Getter<T>, Setter<T>];
export declare function memo<T>(fn: () => T): Getter<T>;
export declare function callback<Args extends any[], R>(fn: (...args: Args) => R): (...args: Args) => R;
export declare const Fragment: unique symbol;
export declare function Zephyr(tag: string | Function | symbol, props: Record<string, any> | null, ...children: any[]): HTMLElement | DocumentFragment;
export declare const jsx: {
    createElement: typeof Zephyr;
};
export declare function render(component: () => HTMLElement, container: HTMLElement): void;
export declare function For<T>(props: ForProps<T>): DocumentFragment;
