"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const nonPhoneQuery = "(min-width: 640px)";

function subscribeToViewport(callback) {
  const media = window.matchMedia(nonPhoneQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getViewportSnapshot() {
  return window.matchMedia(nonPhoneQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export default function useChartLabelVisibility(requiredWidth, enabled = true) {
  const chartRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  const isNonPhone = useSyncExternalStore(
    subscribeToViewport,
    getViewportSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!enabled || !chartRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setChartWidth(entry.contentRect.width);
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, [enabled]);

  return [chartRef, isNonPhone && chartWidth >= requiredWidth];
}
