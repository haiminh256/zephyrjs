export type Location = {
    pathname: string;
    search: string;
    hash: string;
};
type NavigateOptions = {
    replace?: boolean;
};
declare const location: import("@fluxonjs/core").SignalGetter<Location>;
export declare function navigate(to: string, options?: NavigateOptions): void;
declare const params: import("@fluxonjs/core").SignalGetter<Record<string, string>>, setParams: (newValue: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
export { location, params, setParams };
//# sourceMappingURL=router.d.ts.map