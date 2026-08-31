"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export async function toastAndAction({
  loadingLabel = "",
  successLabel = "",
  errorLabel = "",
  action,
  formData = {},
  id = null,
}) {
  // 1. Call the action and get the result immediately
  const toastId = toast.loading(loadingLabel);

  // 2. Execute the action manually
  let result;

  if (!id) result = await action(null, formData);
  else result = await action(id, formData);

  // 3. Handle the result
  if (result?.success) {
    toast.success(result.message || successLabel, {
      duration: 3000,
      id: toastId,
      style: { backgroundColor: "#DCFCE7", color: "#166534" },
    });
  } else {
    toast.error(result?.error || errorLabel, {
      duration: 3000,
      id: toastId,
      style: { backgroundColor: "#FEE2E2", color: "#991B1B" },
    });
  }

  return result;
}

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

export function useFavoriteToggle(postingId, initialFavorited, toggleAction) {
  const DEBOUNCE_MS = 300;

  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const confirmedRef = useRef(initialFavorited); // last state the server actually confirmed
  const desiredRef = useRef(initialFavorited); // where the user's clicks currently want it
  const timeoutRef = useRef(null);

  // If the parent re-fetches and hands us fresh server data, resync
  useEffect(() => {
    confirmedRef.current = initialFavorited;
    desiredRef.current = initialFavorited;
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  const syncWithServer = useCallback(async () => {
    const desired = desiredRef.current;

    // Net effect of all the clicking cancels out — no request needed at all
    if (desired === confirmedRef.current) return;

    try {
      const result = await toggleAction(postingId);

      if (result?.success) {
        confirmedRef.current = result.isFavorited;
        setIsFavorited(result.isFavorited);

        // User kept clicking while the request was in flight — resync once more
        if (desiredRef.current !== confirmedRef.current) {
          syncWithServer();
        }
      } else {
        // Revert to last known-good state on failure
        desiredRef.current = confirmedRef.current;
        setIsFavorited(confirmedRef.current);
      }
    } catch {
      desiredRef.current = confirmedRef.current;
      setIsFavorited(confirmedRef.current);
    }
  }, [postingId, toggleAction]);

  const toggle = useCallback(() => {
    desiredRef.current = !desiredRef.current;
    setIsFavorited(desiredRef.current); // instant optimistic feedback

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(syncWithServer, DEBOUNCE_MS);
  }, [syncWithServer]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { isFavorited, toggle };
}

export function useGetLocation() {
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null, // Added this so you can see the precision in meters
  });

  useEffect(() => {
    // Next.js Safety Guard: Ensures this only runs on the client side (browser)
    if (typeof window === "undefined" || !navigator.geolocation) return;

    // The Secret Sauce for High Accuracy:
    const options = {
      enableHighAccuracy: true, // Forces the device to wake up hardware GPS
      timeout: 15000, // Gives the device up to 15 seconds to lock a signal
      maximumAge: 0, // Prevents caching; always forces a fresh reading
    };

    const successCallback = (position) => {
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy, // Precision buffer in meters
      });
    };

    const errorCallback = (error) => {
      console.error("GPS Tracking Error:", error.message);
    };

    // Trigger the position request
    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      options,
    );
  }, []);

  return userLocation;
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
