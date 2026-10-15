"use client";

export default function DtrLocationFields({ loc, setLoc, radius, setRadius, isPending }) {
  return (
    <>
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
    </>
  );
}
