"use client";

import { useCallback, useRef } from "react";
import { toPosition } from "./mapPositions";

export default function useMapFormSelection({
  setData,
  data,
  formType,
  defaultCoords,
  radius = null,
  setRadius = null,
  liveLocation = null,
}) {
// Both callers store coordinates in their form data. The pin follows that
  // source of truth, including when a form resets or clears the location.
  const selectedPosition = toPosition([data?.lat, data?.lon]);
  const sharedPosition = liveLocation && toPosition([liveLocation.latitude, liveLocation.longitude]);
  const initialCenter = selectedPosition ||
    toPosition(defaultCoords) || [13.9304557, 121.4312752];
  const selectionVersionRef = useRef(0);

  const handleLocationSelect = useCallback(
    (location) => {
      const version = ++selectionVersionRef.current;

      if (formType === "internshipRecord") {
        setData((prev) => ({
          ...prev,
          company_address: location.label,
          lat: location.y,
          lon: location.x,
        }));
      }

      if (formType === "setDtrLocation") {
        setData((prev) => ({
          ...prev,
          lat: location.y,
          lon: location.x,
          address: location.label,
          radius,
        }));
      }

      return version;
    },
    [formType, radius, setData],
  );

  const handleResolvedAddress = useCallback(
    ({ version, label, lat, lon }) => {
      if (version !== selectionVersionRef.current) return;
      setData((prev) => {
        if (Number(prev.lat) !== lat || Number(prev.lon) !== lon) return prev;
        const coordinateLabel = `${lat}, ${lon}`;
        if (formType === "internshipRecord") {
          if (prev.company_address !== coordinateLabel) return prev;
          return { ...prev, company_address: label };
        }
        if (formType === "setDtrLocation") {
          if (prev.address !== coordinateLabel) return prev;
          return { ...prev, address: label };
        }
        return prev;
      });
    },
    [formType, setData],
  );

  const handleRadiusChange = (value) => {
    if (!setRadius) return;
    setRadius(value);

    if (formType === "setDtrLocation") {
      setData((prev) => ({
        ...prev,
        radius: value,
      }));
    }
  };

  const showRadiusControl = formType === "setDtrLocation" && setRadius !== null;
  return {
    selectedPosition,
    sharedPosition,
    initialCenter,
    handleLocationSelect,
    handleResolvedAddress,
    handleRadiusChange,
    showRadiusControl,
  };
}
