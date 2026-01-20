import * as Sentry from "@sentry/react";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AppProvider } from "./components/AppContext";
import Hotjar from "@hotjar/browser";

const isProduction = process.env.NODE_ENV === "production";
const hasSentryDsn = Boolean(process.env.REACT_DSN);
const runAfterFirstPaint = (cb) => {
  if (typeof window === "undefined") return;
  const schedule = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 1200));
  schedule(cb);
};

if (isProduction && hasSentryDsn) {
  Sentry.init({
    dsn: process.env.REACT_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.2,
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
  });

  runAfterFirstPaint(async () => {
    try {
      const replayFactory = await Sentry.lazyLoadIntegration("replayIntegration");
      const replayIntegration = replayFactory();
      if (typeof Sentry.addIntegration === "function") {
        Sentry.addIntegration(replayIntegration);
      } else {
        Sentry.getCurrentHub().getClient()?.addIntegration?.(replayIntegration);
      }
    } catch (error) {
      console.warn("Failed to lazy load Sentry Replay:", error);
    }
  });
}

if (isProduction) {
  const siteId = 5173024; // production-only Hotjar
  const hotjarVersion = 6;
  runAfterFirstPaint(() => {
    try {
      Hotjar.init(siteId, hotjarVersion);
    } catch (error) {
      console.warn("Failed to initialize Hotjar:", error);
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
