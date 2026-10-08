"use client";

import { queryOptions } from "@tanstack/react-query";
import { getMapLocationsResult } from "@/lib/server-actions/map-actions";

export const mapLocationsKeys = {
  all: (userId) => ["map-locations", String(userId)],
};

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
