"use client";

import { useMemo, useState, useTransition } from "react";
import { MapPin, Save, Trash2, Crosshair } from "lucide-react";
import MapFormContainer from "./MapFormContainer";
import { toastAndAction } from "../_services/helpers";
import { setSearchedStudentDtrLocation } from "../_services/employer-actions";

const SetDtrLocation = ({ searchedUserId, dataLocation = {} }) => {
  const [loc, setLoc] = useState({
    lat: dataLocation.location.lat || "",
    lon: dataLocation.location.lon || "",
    label: dataLocation.location.label || "",
    internshipId: dataLocation.internship_id || "",
    updatedAt: dataLocation.location.updated_at || null,
  });
  const [radius, setRadius] = useState(
    dataLocation.location.radius_meters || 150,
  );
  const [isPending, startTransition] = useTransition();

  console.log(dataLocation);

  function handleSetLocation() {
    const formData = {
      searchedUserId,
      internshipId: loc.internshipId,
      lat: loc.lat,
      lon: loc.lon,
      label: loc.label,
      radius_meter: radius,
    };

    console.log(formData);

    const handlers = {
      loadingLabel: "Setting DTR location...",
      successLabel: "DTR location setted!",
      errorLabel: "Setting DTR location failed.",
      action: setSearchedStudentDtrLocation,
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
          internshipId: saved.internship_id ?? "",
          updatedAt: saved.updated_at ?? new Date().toISOString(),
        });
        setRadius(saved.radius_meters ?? 150);
      }
    });
  }

  function handleClear() {
    setLoc((prev) => ({
      ...prev,
      lat: "",
      lon: "",
      label: "",
      updatedAt: "",
    }));
    setRadius(0);
  }

  const defaultCoords = useMemo(() => [loc.lat, loc.lon], [loc.lat, loc.lon]);

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6 mt-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary-500/10 text-primary-500">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-stone-800">DTR Location</h3>
          <p className="text-xs text-stone-600 mt-0.5">
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
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-stone-100 rounded-xl p-3">
          <p className="text-xs text-stone-600">Latitude</p>
          <p className="text-sm font-medium text-stone-800 mt-0.5">
            {loc.lat ? loc.lat : "—"}
          </p>
        </div>
        <div className="bg-stone-100 rounded-xl p-3">
          <p className="text-xs text-stone-600">Longitude</p>
          <p className="text-sm font-medium text-stone-800 mt-0.5">
            {loc.lon ? loc.lon : "—"}
          </p>
        </div>
        <div className="bg-stone-100 rounded-xl p-3">
          <label className="text-xs text-stone-600" htmlFor="radius">
            Allowed radius (m)
          </label>
          <input
            type="number"
            id="radius"
            min={20}
            max={2000}
            step={10}
            disabled={(!loc.lat && !loc.lon) || isPending}
            defaultValue={radius || 150}
            onChange={(e) => loc.lat && loc.lon && setRadius(e.target.value)}
            className="mt-0.5 w-full bg-transparent text-sm font-medium text-stone-800 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-stone-600">Location label</label>
        <input
          type="text"
          disabled={(!loc.lat && !loc.lon) || isPending}
          defaultValue={loc.label}
          onChange={(e) =>
            loc.lat && loc.lon && setLoc({ ...loc, label: e.target.value })
          }
          placeholder="e.g. Main Office - 3rd Floor"
          className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <Crosshair className="w-3.5 h-3.5" />
          {loc ? (
            <span>
              Saved · updated {new Date(loc.updatedAt).toLocaleString()}
            </span>
          ) : (
            <span>No DTR location set yet</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {loc && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          )}
          <button
            onClick={handleSetLocation}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-500/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> Save location
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetDtrLocation;
