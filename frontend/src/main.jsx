import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.jsx";
import * as serviceWorker from "./serviceWorker";
import store from "./store";

ReactDOM.render(
  React.createElement(
    Provider,
    { store },
    React.createElement(React.StrictMode, null, React.createElement(App))
  ),
  document.getElementById("root")
);

serviceWorker.unregister();
