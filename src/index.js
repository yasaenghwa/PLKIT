/* global ENACT_PACK_ISOMORPHIC */
import { createRoot, hydrateRoot } from "react-dom/client";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";

const appElement = <App />;

console.log("App element created:", appElement); // App 생성 확인

// In a browser environment, render instead of exporting
if (typeof window !== "undefined") {
  console.log("Window is defined, rendering the app..."); // 브라우저 환경 확인
  if (ENACT_PACK_ISOMORPHIC) {
    hydrateRoot(document.getElementById("root"), appElement);
  } else {
    createRoot(document.getElementById("root")).render(appElement);
  }
}

export default appElement;

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint.
// Learn more: https://github.com/enactjs/cli/blob/master/docs/measuring-performance.md
reportWebVitals();
