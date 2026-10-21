"use client";
import { LocateFixed } from 'lucide-react';
export default function MapViewerLocationControls({ location, origin, embedded = false }) {
  return <div className={`flex flex-wrap items-center justify-between gap-3 ${embedded ? "" : "rounded-xl border border-border bg-card p-4"}`}>
    <div className="min-w-0 text-xs text-muted-foreground"><p className="flex items-center gap-2 font-semibold text-foreground"><LocateFixed className="size-4" />Routes start from {origin.label}</p>
      <p role="status" className="mt-1">{location.status}{location.position ? ' Accuracy: about ' + Math.round(location.position.accuracy) + ' m.' : ''}</p>
      <p className="mt-1">Private to this map session. Updates stop when you leave.</p>
    </div>
    <button type="button" onClick={location.enabled ? location.stop : location.start} className="min-h-10 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted">{location.enabled ? 'Use Candelaria instead' : 'Use my location'}</button>
  </div>;
}
