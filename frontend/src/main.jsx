import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import store from "./store";

console.log("[main] bootstrapping app");
const rootEl = document.getElementById("root");
if (rootEl) {
  rootEl.innerHTML =
    '<div style="padding:1rem;color:#fff;background:#222">Booting…</div>';
}

import("./App.jsx")
  .then(({ default: App }) => {
    console.log("[main] rendering App");
    ReactDOM.render(
      <Provider store={store}>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </Provider>,
      rootEl
    );
  })
  .catch((err) => {
    console.error("[main] Failed to load App:", err);
    if (rootEl) {
      rootEl.innerHTML = `<pre style="white-space:pre-wrap;color:#fff;background:#600;padding:1rem;border-radius:8px">Failed to load App: ${
        err && err.message ? err.message : err
      }</pre>`;
    }
  });

serviceWorker.unregister();
