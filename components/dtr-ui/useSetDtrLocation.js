"use client";

import { useMemo, useState, useTransition } from "react";
import { toastAndAction } from "@/lib/helpers";
import { toast } from "sonner";
import { setStudentDtrLocation, removeStudentDtrLocation } from "@/lib/server-actions/dtr-actions";
import useLiveDtrLocationWatch from "../map-ui/useLiveDtrLocationWatch";

export default function useSetDtrLocation({ studentId, dataLocation = {}, onSaved }) {
  const [loc, setLoc] = useState({
    lat: dataLocation.location.lat || "",
    lon: dataLocation.location.lon || "",
    label: dataLocation.location.label ?? "",
    address: dataLocation.location.address ?? "",
    internshipId: dataLocation.internship_id || "",
    updatedAt: dataLocation.location.updated_at || null,
  });
  const [radius, setRadius] = useState(
    dataLocation.location.radius_meters || 150,
  );
  const [isPending, startTransition] = useTransition();
  const [confirmation, setConfirmation] = useState(null);
  const [isCustom, setIsCustom] = useState(Boolean(dataLocation.is_custom_location));
  const { liveLocation, liveStatus } = useLiveDtrLocationWatch(studentId, loc.internshipId);

  function handleUseSharedLocation() {
    if (!liveLocation) return;
    setLoc((current) => ({
      ...current,
      lat: liveLocation.latitude,
      lon: liveLocation.longitude,
      label: "",
      address: "",
      updatedAt: null,
    }));
  }

  function handleSetLocation() {
    const formData = {
      studentId,
      internshipId: loc.internshipId,
      lat: loc.lat,
      lon: loc.lon,
      label: loc.label,
      address: loc.address,
      radius_meter: radius,
    };

    const handlers = {
      loadingLabel: "Setting DTR location...",
      successLabel: "DTR location setted!",
      errorLabel: "Setting DTR location failed.",
      action: setStudentDtrLocation,
      formData,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);

      if (result.success && result.dtrLocation) {
        const saved = result.dtrLocation;
        setLoc({
          lat: saved.lat ?? "",
          lon: saved.lon ?? "",
          label: saved.label ?? "",
          address: saved.address ?? "",
          internshipId: saved.internship_id ?? "",
          updatedAt: saved.updated_at ?? new Date().toISOString(),
        });
        setRadius(saved.radius_meters ?? 150);
        setIsCustom(true);
        onSaved?.(saved);
      }
    });
  }

  function handleClear() {
    setLoc((prev) => ({
      ...prev,
      lat: "",
      lon: "",
      label: "",
      address: "",
      updatedAt: "",
    }));
    setRadius(0);
  }

  function handleRemove() {
    if (!isCustom) {
      handleClear();
      return;
    }
    startTransition(async () => {
      const result = await removeStudentDtrLocation(studentId, loc.internshipId);
      if (!result?.success) {
        toast.error(result?.error || "Could not remove DTR location.");
        return;
      }
      const fallback = result.dtrLocation;
      setLoc({
        lat: fallback?.lat ?? "", lon: fallback?.lon ?? "",
        label: fallback?.label ?? "", address: fallback?.address ?? "",
        internshipId: loc.internshipId, updatedAt: null,
      });
      setRadius(fallback?.radius_meters ?? 150);
      setIsCustom(false);
      onSaved?.({ ...fallback, is_custom_location: false });
      toast.success("Custom DTR location removed. The company location is now the default.");
    });
  }

  const defaultCoords = useMemo(() => [loc.lat, loc.lon], [loc.lat, loc.lon]);
  return {
    loc,
    setLoc,
    radius,
    setRadius,
    isPending,
    confirmation,
    setConfirmation,
    isCustom,
    liveLocation,
    liveStatus,
    handleUseSharedLocation,
    handleSetLocation,
    handleRemove,
    defaultCoords,
  };
}
