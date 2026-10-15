"use client";

import { Crosshair, Trash2, Save } from "lucide-react";

export default function DtrLocationActions({ loc, isPending, setConfirmation }) {
  return (
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
  );
}
