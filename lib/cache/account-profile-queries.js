"use client";

import { queryOptions } from "@tanstack/react-query";
import { getUserProfileResult } from "@/lib/server-actions/account-actions";

// Cache the signed-in user's editable account profile under that user's identity.
// Turn action errors into query errors; this cache key does not authorize the backend read.
export const accountProfileKeys = {
  profile: (userId) => ["account-profile", String(userId)],
};

export function accountProfileOptions(userId) {
  return queryOptions({
    queryKey: accountProfileKeys.profile(userId),
    queryFn: async () => {
      const result = await getUserProfileResult();
      if (!result || result.error || typeof result !== "object") {
        throw new Error(result?.error || "Could not load your profile.");
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
