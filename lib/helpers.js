"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { reconcileFavoriteToggle } from "./favorite-toggle-sync.mjs";
import { getFreshLocation } from "./geolocation.mjs";
import { createToastAndAction } from "./toast-and-action.mjs";

export const toastAndAction = createToastAndAction(toast);

//DEBOUNCE
export function useApiFetch(query, delay = 500) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timeoutRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    // Always clear any pending timer/request first, regardless of branch below.
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (controllerRef.current) controllerRef.current.abort();

    if (!query) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Flip loading on immediately so it covers the debounce wait too,
    // not just the network request. Also clear stale data from the
    // previous query so old results don't linger on screen.
    setLoading(true);
    setError(null);
    setData(null);

    timeoutRef.current = setTimeout(async () => {
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await fetch(query, { signal: controller.signal });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const result = await response.json();
        setData(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (controllerRef.current === controller) {
          setLoading(false);
        }
      }
    }, delay);

    return () => {
      clearTimeout(timeoutRef.current);
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [query, delay]);

  return { data, loading, error, setData };
}

export function useFavoriteToggle(postingId, initialFavorited, toggleAction, onSettled) {
  const DEBOUNCE_MS = 300;

  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const confirmedRef = useRef(initialFavorited); // last state the server actually confirmed
  const desiredRef = useRef(initialFavorited); // where the user's clicks currently want it
  const timeoutRef = useRef(null);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);
  const onSettledRef = useRef(onSettled);

  useEffect(() => {
    onSettledRef.current = onSettled;
  }, [onSettled]);

  // If the parent re-fetches and hands us fresh server data, resync
  useEffect(() => {
    if (inFlightRef.current || desiredRef.current !== confirmedRef.current) {
      return;
    }
    confirmedRef.current = initialFavorited;
    desiredRef.current = initialFavorited;
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  const syncWithServer = useCallback(async () => {
    if (inFlightRef.current || !mountedRef.current) return;
    const hadPendingChange = desiredRef.current !== confirmedRef.current;
    inFlightRef.current = true;
    try {
      await reconcileFavoriteToggle({
        getDesired: () => desiredRef.current,
        getConfirmed: () => confirmedRef.current,
        toggle: () => toggleAction(postingId),
        onConfirmed: (value) => {
          confirmedRef.current = value;
        },
        onFailure: (failure) => {
          desiredRef.current = confirmedRef.current;
          setIsFavorited(confirmedRef.current);
          toast.error(failure?.error || "Failed to update favorite. Please try again.");
        },
        isActive: () => mountedRef.current,
      });
    } finally {
      inFlightRef.current = false;
      if (hadPendingChange && mountedRef.current) {
        onSettledRef.current?.(postingId, confirmedRef.current);
      }
    }
  }, [postingId, toggleAction]);

  const toggle = useCallback(() => {
    desiredRef.current = !desiredRef.current;
    setIsFavorited(desiredRef.current); // instant optimistic feedback

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!inFlightRef.current) {
      timeoutRef.current = setTimeout(syncWithServer, DEBOUNCE_MS);
    }
  }, [syncWithServer]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { isFavorited, toggle };
}

export function useGetLocation(autoLoad = true) {
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null, // Added this so you can see the precision in meters
  });

  useEffect(() => {
    if (!autoLoad) return;
    getFreshLocation().then(setUserLocation).catch((error) => {
      console.error("GPS Tracking Error:", error.message);
    });
  }, [autoLoad]);

  return { ...userLocation, refreshLocation: getFreshLocation };
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;

  // return {
  //   ...windowSize,
  //   xl: windowSize.width >= 1280,
  //   lg: windowSize.width >= 1024 && windowSize.width < 1280,
  //   md: windowSize.width >= 768 && windowSize.width < 1024,
  //   sm: windowSize.width >= 640 && windowSize.width < 768,
  // };
}

export function calculateShiftHours(clockInStr, clockOutStr) {
  const today = new Date();
  const start = parse(clockInStr, "HH:mm:ss", today);
  const end = parse(clockOutStr, "HH:mm:ss", today);
  return Number((differenceInMinutes(end, start) / 60).toFixed(2));
}
