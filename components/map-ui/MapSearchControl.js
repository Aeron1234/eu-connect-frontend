"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import styles from "./MapSearchControl.module.css";

export default function MapSearchControl({ onLocationSelect }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        "accept-language": "en",
        countrycodes: "ph",
      },
    });

    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: false,
      showPopup: false,
      autoComplete: true,
      autoCompleteDelay: 1000,
      minLength: 3,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      keepResult: true,
      searchLabel: "Search for company address...",
    });

    map.addControl(searchControl);

    const { input, form } = searchControl.searchElement;
    const loading = document.createElement("span");
    loading.className = styles.loading;
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-live", "polite");
    loading.hidden = true;
    const spinner = document.createElement("span");
    spinner.className = styles.spinner;
    spinner.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = "Searching locations...";
    loading.append(spinner, label);
    form.appendChild(loading);
    const results = searchControl.resultList.container;
    const originalResultsDisplay = results.style.display;

    let active = true;
    let version = 0;
    // Track requests by input version. An older response must not hide the spinner
    // for a newer query; multiple searches for one version settle together.
    const pending = new Map();
    const setLoading = (busy) => {
      if (!active) return;
      loading.hidden = !busy;
      results.style.display = busy ? "none" : originalResultsDisplay;
      input.setAttribute("aria-busy", String(busy));
    };
    const handleInput = () => {
      version++;
      // Include the existing one-second debounce in the visible waiting state.
      setLoading(input.value.length > 0);
    };
    // Reset, Escape and selection invalidate older loading completions. Requests
    // already in flight are not cancelled by this UI reset.
    const clearLoading = () => {
      version++;
      setLoading(false);
    };
    const handleKeyUp = (event) => {
      if (event.key === "Escape") clearLoading();
    };
    const search = provider.search.bind(provider);
    provider.search = async (options) => {
      // The library's debounce may fire after the control has been removed.
      if (!active) return [];
      const currentVersion = version;
      pending.set(currentVersion, (pending.get(currentVersion) || 0) + 1);
      setLoading(true);
      try {
        return await search(options);
      } finally {
        const remaining = pending.get(currentVersion) - 1;
        if (remaining) pending.set(currentVersion, remaining);
        else pending.delete(currentVersion);
        if (currentVersion === version && !remaining) setLoading(false);
      }
    };
    input.addEventListener("input", handleInput);
    input.addEventListener("keyup", handleKeyUp);
    searchControl.resetButton.addEventListener("click", clearLoading);

    const handleShowLocation = (result) => {
      clearLoading();
      if (onLocationSelect) {
        onLocationSelect(result.location);
      }
    };

    map.on("geosearch/showlocation", handleShowLocation);

    return () => {
      active = false;
      input.removeEventListener("input", handleInput);
      input.removeEventListener("keyup", handleKeyUp);
      searchControl.resetButton.removeEventListener("click", clearLoading);
      input.removeAttribute("aria-busy");
      results.style.display = originalResultsDisplay;
      loading.remove();
      map.off("geosearch/showlocation", handleShowLocation);
      map.removeControl(searchControl);
    };
  }, [map, onLocationSelect]);

  return null;
}
