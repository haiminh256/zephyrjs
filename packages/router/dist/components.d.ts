type RouteConfig = {
    path: string;
    element: any;
};
export declare function Router(props: {
    routes: RouteConfig[];
    fallback?: any;
}): DocumentFragment;
export declare function Link(props: {
    to: string;
    children?: any;
    class?: string;
}): import("@fluxonjs/core").JSX.Element;
export {};
//# sourceMappingURL=components.d.ts.map