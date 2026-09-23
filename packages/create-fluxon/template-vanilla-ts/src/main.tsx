import { render, fluxonjs, Fragment } from "@fluxonjs/core";
import App from "./App";

const root = document.getElementById("app");
if (root) {
  render(() => <App />, root);
}