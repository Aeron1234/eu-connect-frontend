"use client";
import { useSyncExternalStore } from 'react';
const query = '(max-width: 1023px)';
function subscribe(callback) {
  const media = window.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
const snapshot = () => window.matchMedia(query).matches;
const serverSnapshot = () => false;
// Subscribe to the map's below-lg breakpoint (up to 1023 px). The server snapshot
// is false; matchMedia supplies the browser value after hydration and on changes.
export default function useSmallMapViewport() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
