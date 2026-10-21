"use client";

import { ExternalLink, LoaderCircle, Route, X } from "lucide-react";
import {
  directionsUrl,
  routeDistance,
  routeDuration,
} from "./mapVisitPlanning.mjs";

export default function MapDirections({
  site,
  origin,
  query,
  onShowRoute,
  onClearRoute,
  active = false,
}) {
  const googleUrl = directionsUrl(site, origin);
  const routeError =
    query?.error?.message ||
    "The road route could not be loaded. Try again or use Google Maps below.";
  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      <p className="text-xs font-medium text-foreground-soft">
        From {origin.label}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onShowRoute}
          disabled={active && query?.isFetching}
          aria-busy={Boolean(active && query?.isFetching)}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {active && query?.isFetching ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Route className="size-4" />
          )}
          {active && query?.isFetching ? "Finding route…" : "Show road route"}
        </button>
        {active && (
          <button
            type="button"
            onClick={onClearRoute}
            aria-label="Clear route"
            className="rounded-lg border border-border p-2 text-foreground-soft"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {active && query?.isFetching && (
        <p role="status" className="text-xs text-foreground-soft">
          Finding a road route to {site.company}…
        </p>
      )}
      {active && query?.isError && (
        <p
          role="status"
          className="text-xs leading-relaxed text-foreground-soft"
        >
          {routeError}
        </p>
      )}
      {active && query?.data && (
        <div
          role="status"
          className="rounded-lg bg-muted p-3 text-sm text-foreground"
        >
          <p className="font-semibold">
            {routeDistance(query.data.distance_meters)} ·{" "}
            {routeDuration(query.data.duration_seconds)}
          </p>
          <p className="mt-1 text-xs text-foreground-soft">
            Estimated driving time. Traffic and stops are not included.
          </p>
        </div>
      )}
      {googleUrl && (
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-primary-emphasis hover:underline"
        >
          Open Google Maps directions <ExternalLink className="size-3.5" />
        </a>
      )}
    </div>
  );
}
