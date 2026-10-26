"use client";

import { requestMapRoute } from "@/components/map-ui/requestMapRoute.mjs";
import { queryOptions } from "@tanstack/react-query";
import { readMapRoute } from "@/components/map-ui/readMapRoute.mjs";
import { getMapLocationsResult } from "@/lib/server-actions/map-actions";

export const mapLocationsKeys = {
  all: (userId) => ["map-locations", String(userId)],
};

// Use a representative matching internship for backend destination lookup; include
// viewer, saved destination and optional live origin coordinates in the query key.
// Live routes have short freshness and no inactive retention; campus routes reuse an hour.
export function mapCompanyRouteOptions(userId, site, origin = null) {
  return queryOptions({
    queryKey: [...mapLocationsKeys.all(userId), "route", site?.interns?.[0]?.id, site?.lat, site?.lng, origin?.lat, origin?.lng],
    queryFn: () => requestMapRoute(readMapRoute, site.interns[0].id, origin, 25000, fetch, 1100,
      (id, start, options) => readMapRoute(id, start, { ...options, serverRoute: true })),
    enabled: Boolean(userId && site?.interns?.[0]?.id),
    staleTime: origin ? 30_000 : 60 * 60_000, gcTime: origin ? 0 : 60 * 60_000,
    retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false,
  });
}

export function mapLocationsOptions(userId) {
  return queryOptions({
    queryKey: mapLocationsKeys.all(userId),
    queryFn: async () => {
      const result = await getMapLocationsResult();
      if (!Array.isArray(result?.companies) || !Array.isArray(result?.availableRegions)) {
        throw new Error(result?.error || "Could not load map locations.");
      }
      return result;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
