import { signal } from "@fluxonjs/core";

export type Location = {
  pathname: string;
  search: string;
  hash: string;
};

type NavigateOptions = {
  replace?: boolean;
};

const [location, setLocation] = signal<Location>({
  pathname: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash,
});

window.addEventListener("popstate", () => {
  setLocation({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  });
});

export function navigate(to: string, options: NavigateOptions = {}) {
  if (options.replace) {
    window.history.replaceState(null, "", to);
  } else {
    window.history.pushState(null, "", to);
  }

  setLocation({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  });
}

const [params, setParams] = signal<Record<string, string>>({});

export { location, params, setParams };