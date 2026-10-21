"use client";

import { requestMapRoute } from "@/components/map-ui/requestMapRoute.mjs";
import { queryOptions } from "@tanstack/react-query";
import { getMapLocationsResult, getMapCompanyRouteResult } from "@/lib/server-actions/map-actions";

export const mapLocationsKeys = {
  all: (userId) => ["map-locations", String(userId)],
};

export function mapCompanyRouteOptions(userId, site, origin = null) {
  return queryOptions({
    queryKey: [...mapLocationsKeys.all(userId), "route", site?.interns?.[0]?.id, site?.lat, site?.lng, origin?.lat, origin?.lng],
    queryFn: () => requestMapRoute(getMapCompanyRouteResult, site.interns[0].id, origin),
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
