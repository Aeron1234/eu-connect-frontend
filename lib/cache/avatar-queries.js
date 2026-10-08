"use client";

import { queryOptions } from "@tanstack/react-query";
import { getAvailableAvatarsResult } from "@/lib/server-actions/account-actions";

export const avatarKeys = {
  choices: (userId) => ["avatar-choices", String(userId)],
};

export function avatarChoicesOptions(userId) {
  return queryOptions({
    queryKey: avatarKeys.choices(userId),
    queryFn: async () => {
      const result = await getAvailableAvatarsResult();
      if (!Array.isArray(result?.avatars)) {
        throw new Error(result?.error || "Could not load avatars.");
      }
      return result.avatars;
    },
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
