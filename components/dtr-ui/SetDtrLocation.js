"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { MapPin, Save, Trash2, Crosshair } from "lucide-react";
import MapFormContainer from "../map-ui/MapFormContainer";
import { toastAndAction } from "../../lib/helpers";
import { toast } from "sonner";
import { setStudentDtrLocation, removeStudentDtrLocation } from "@/lib/server-actions/dtr-actions";
import { socket } from "@/components/ui/SocketProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const SetDtrLocation = ({ studentId, dataLocation = {}, onSaved }) => {
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
  const [liveLocation, setLiveLocation] = useState(null);
  const [liveStatus, setLiveStatus] = useState("Waiting for the student to share a location.");

  useEffect(() => {
    const internshipId = loc.internshipId;
    if (!studentId || !internshipId) return;
    const targetStudentId = String(studentId);
    const targetInternshipId = String(internshipId);
    let active = true;
    let subscriptionVersion = 0;

    function subscribe() {
      const version = ++subscriptionVersion;
      socket.emit("dtr_location:watch", {
        studentId: targetStudentId, internshipId: targetInternshipId,
      }, (reply) => {
        if (!active || version !== subscriptionVersion) return;
        setLiveLocation(reply?.ok ? reply.location : null);
        setLiveStatus(reply?.ok
          ? reply.location ? "Student is sharing a live position." : "Waiting for the student to share a location."
          : reply?.error || "Live location unavailable.");
      });
    }
    function onUpdate(event) {
      if (String(event?.studentId) !== targetStudentId || String(event?.internshipId) !== targetInternshipId) return;
      setLiveLocation(event.location);
      setLiveStatus(event.location
        ? "Student is sharing a live position."
        : "The student stopped sharing or their position expired.");
    }
    function onDisconnect() {
      setLiveLocation(null);
      setLiveStatus("Live connection unavailable.");
    }
    socket.on("dtr_location:update", onUpdate);
    socket.on("connect", subscribe);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) subscribe();
    const accessTimer = setInterval(() => {
      if (socket.connected) subscribe();
    }, 30_000);
    return () => {
      active = false;
      subscriptionVersion += 1;
      clearInterval(accessTimer);
      socket.off("dtr_location:update", onUpdate);
      socket.off("connect", subscribe);
      socket.off("disconnect", onDisconnect);
      if (socket.connected) socket.emit("dtr_location:unwatch");
    };
  }, [studentId, loc.internshipId]);

  useEffect(() => {
    if (!liveLocation) return;
    const timer = setTimeout(() => {
      setLiveLocation(null);
      setLiveStatus("The student's shared position expired.");
    }, Math.max(0, 60_000 - (Date.now() - liveLocation.timestamp)));
    return () => clearTimeout(timer);
  }, [liveLocation]);

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

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mt-4 space-y-4">
      <ConfirmDialog open={Boolean(confirmation)} onOpenChange={(open) => { if (!open) setConfirmation(null); }} title={confirmation === "remove" ? "Remove DTR location?" : "Save DTR location?"} description={confirmation === "remove" ? isCustom ? "The custom location will be removed. Attendance will use the company's default location again." : "The unsaved pin will be cleared from this form." : "The student's clock-in and clock-out location will use this pin and radius."} confirmLabel={confirmation === "remove" ? "Remove location" : "Save location"} destructive={confirmation === "remove"} pending={isPending} onConfirm={() => { const action = confirmation; setConfirmation(null); if (action === "remove") handleRemove(); else if (action === "save") handleSetLocation(); }} />
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary-emphasis">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            DTR Location
          </h3>
          <p className="text-xs text-foreground-soft mt-0.5">
            Set the on-site location where the student is allowed to record
            their DTR — both clock-in and clock-out must be done within the
            allowed radius. Tap the map to drop a pin, then adjust the radius.
          </p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-border/60">
        <MapFormContainer
          data={loc}
          setData={setLoc}
          mapStyle={{ height: "400px", width: "100%" }}
          formType={"setDtrLocation"}
          defaultCoords={defaultCoords}
          radius={radius}
          setRadius={setRadius}
          liveLocation={liveLocation}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted p-3 text-xs">
        <div className="min-w-0 text-foreground-soft" role="status">
          <p>{liveStatus}</p>
          {liveLocation && (
            <p className="mt-1">
              Blue pin: about {Math.round(liveLocation.accuracy)} m accuracy.
              {Number(liveLocation.accuracy) > Number(radius) &&
                " This is wider than the allowed DTR radius; verify the position before saving."}
            </p>
          )}
        </div>
        {liveLocation && (
          <button
            type="button"
            onClick={handleUseSharedLocation}
            disabled={isPending}
            className="rounded-md bg-primary px-3 py-2 font-medium text-white disabled:opacity-50"
          >
            Use student&apos;s pin
          </button>
        )}
      </div>

      <div className="bg-muted rounded-xl p-3">
        <p className="text-xs text-foreground-soft">Address</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">
          {loc.address ? loc.address : "—"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-muted rounded-xl p-3">
          <p className="text-xs text-foreground-soft">Latitude</p>
          <p className="text-sm font-medium text-foreground mt-0.5">
            {loc.lat ? loc.lat : "—"}
          </p>
        </div>
        <div className="bg-muted rounded-xl p-3">
          <p className="text-xs text-foreground-soft">Longitude</p>
          <p className="text-sm font-medium text-foreground mt-0.5">
            {loc.lon ? loc.lon : "—"}
          </p>
        </div>
        <div className="bg-muted rounded-xl p-3">
          <label className="text-xs text-foreground-soft" htmlFor="radius">
            Allowed radius (m)
          </label>
          <input
            type="number"
            id="radius"
            min={20}
            max={2000}
            step={10}
            disabled={(!loc.lat && !loc.lon) || isPending}
            value={radius || ""}
            onChange={(e) => loc.lat && loc.lon && setRadius(e.target.value)}
            className="mt-0.5 w-full bg-transparent text-sm font-medium text-foreground focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-foreground-soft">Location label</label>
        <input
          type="text"
          disabled={(!loc.lat && !loc.lon) || isPending}
          value={loc.label}
          onChange={(e) =>
            loc.lat && loc.lon && setLoc({ ...loc, label: e.target.value })
          }
          placeholder="e.g. Main Office - 3rd Floor"
          className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-foreground-soft">
          <Crosshair className="w-3.5 h-3.5" />
          {loc.updatedAt ? (
            <span>
              Saved · updated {new Date(loc.updatedAt).toLocaleString()}
            </span>
          ) : (
            <span>{loc.lat !== "" && loc.lon !== "" ? "Unsaved location" : "No DTR location set yet"}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {loc && (
            <button
              onClick={() => setConfirmation("remove")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          )}
          <button
            onClick={() => setConfirmation("save")}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> Save location
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetDtrLocation;
