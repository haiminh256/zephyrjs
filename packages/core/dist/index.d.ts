export * from "./jsx-runtime";
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
export declare function effect(fn: () => void): void;
export declare function signal<T>(initialValue: T): [SignalGetter<T>, Setter<T>];
export declare function memo<T>(fn: () => T): Getter<T>;
export declare function callback<Args extends any[], R>(fn: (...args: Args) => R): (...args: Args) => R;
export declare const Fragment: unique symbol;
export declare function fluxonjs(tag: string | Function | symbol, props: Record<string, any> | null, ...children: any[]): Node;
export declare const jsx: {
    createElement: typeof fluxonjs;
};
export declare function render(code: Element | DocumentFragment | (() => Element | DocumentFragment | Node), container: HTMLElement): void;
export declare function For<T>(props: ForProps<T>): DocumentFragment;
//# sourceMappingURL=index.d.ts.map