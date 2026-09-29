// src/router.ts
import { signal } from "@fluxonjs/core";
var [location, setLocation] = signal({
  pathname: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash
});
window.addEventListener("popstate", () => {
  setLocation({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash
  });
});
function navigate(to, options = {}) {
  if (options.replace) {
    window.history.replaceState(null, "", to);
  } else {
    window.history.pushState(null, "", to);
  }
  setLocation({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash
  });
}
var [params, setParams] = signal({});

// src/components.tsx
import { effect } from "@fluxonjs/core";

// src/match.ts
function matchPath(pattern, path) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params2 = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    const u = pathParts[i];
    if (p.startsWith(":")) {
      params2[p.slice(1)] = decodeURIComponent(u);
    } else if (p !== u) {
      return null;
    }
  }
  return params2;
}

// src/components.tsx
import { jsx } from "@fluxonjs/core/jsx-runtime";
function Router(props) {
  const fragment = document.createDocumentFragment();
  const startMarker = document.createComment("router-start");
  const endMarker = document.createComment("router-end");
  fragment.appendChild(startMarker);
  fragment.appendChild(endMarker);
  let currentNode = null;
  effect(() => {
    const currentPath = location().pathname;
    const parent = startMarker.parentNode;
    if (!parent) return;
    if (currentNode && currentNode.parentNode) {
      currentNode.parentNode.removeChild(currentNode);
      currentNode = null;
    }
    let element = props.fallback ?? null;
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
function Link(props) {
  return /* @__PURE__ */ jsx(
    "a",
    {
      href: props.to,
      class: props.class,
      onClick: (e) => {
        e.preventDefault();
        navigate(props.to);
      },
      children: props.children
    }
  );
}
export {
  Link,
  Router,
  location,
  navigate,
  params
};
//# sourceMappingURL=index.js.map