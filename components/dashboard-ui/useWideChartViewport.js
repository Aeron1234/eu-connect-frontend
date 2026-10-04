"use client";

import { useSyncExternalStore } from "react";

const wideChartQuery = "(min-width: 1025px)";

function subscribeToViewport(callback) {
  const media = window.matchMedia(wideChartQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getViewportSnapshot() {
  return window.matchMedia(wideChartQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export default function useWideChartViewport() {
  return useSyncExternalStore(
    subscribeToViewport,
    getViewportSnapshot,
    getServerSnapshot,
  );
}
