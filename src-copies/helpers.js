"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export async function toastAndAction({
  loadingLabel,
  successLabel,
  errorLabel,
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
}

export function useApiFetch(query, delay = 500) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use refs to persist the timer and controller across renders
  const timeoutRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    // 1. Reset states and clear previous logic
    if (!query) {
      setData(null);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (controllerRef.current) controllerRef.current.abort();

    // 2. Setup the Debounce
    timeoutRef.current = setTimeout(async () => {
      // Create a fresh AbortController for this specific request
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(query, { signal: controller.signal });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const result = await response.json();
        setData(result);
      } catch (err) {
        // Only set error if it wasn't an intentional abort
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        // Only stop loading if this is still the active controller
        if (controllerRef.current === controller) {
          setLoading(false);
        }
      }
    }, delay);

    // 3. Cleanup function: runs if the component unmounts or query changes
    return () => {
      clearTimeout(timeoutRef.current);
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [query, delay]);

  return { data, loading, error, setData };
}

export function useGetLocation() {
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  });

  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async (position) => {
    setUserLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  });

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
