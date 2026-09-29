import { effect } from "@fluxonjs/core";
import { location, setParams, navigate } from "./router";
import { matchPath } from "./match";

type RouteConfig = {
  path: string;
  element: any;
};

export function Router(props: { routes: RouteConfig[]; fallback?: any }) {
  const fragment = document.createDocumentFragment();
  const startMarker = document.createComment("router-start");
  const endMarker = document.createComment("router-end");

  fragment.appendChild(startMarker);
  fragment.appendChild(endMarker);

  let currentNode: Node | null = null;

  effect(() => {
    const currentPath = location().pathname;
    const parent = startMarker.parentNode;
    if (!parent) return;

    if (currentNode && currentNode.parentNode) {
      currentNode.parentNode.removeChild(currentNode);
      currentNode = null;
    }

    let element: any = props.fallback ?? null;

    for (const route of props.routes) {
      const matchedParams = matchPath(route.path, currentPath);
      if (matchedParams) {
        setParams(matchedParams);
        element = route.element;
        break;
      }
    }

    if (!element) {
      setParams({});
      return;
    }

    const node = typeof element === "function" ? element() : element;

    if (node instanceof Node) {
      currentNode = node;
      parent.insertBefore(node, endMarker);
    }
  });

  return fragment;
}

export function Link(props: { to: string; children?: any; class?: string }) {
  return (
    <a
      href={props.to}
      class={props.class}
      onClick={(e: MouseEvent) => {
        e.preventDefault();
        navigate(props.to);
      }}
    >
      {props.children}
    </a>
  );
}