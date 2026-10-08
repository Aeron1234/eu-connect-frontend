"use client";

import { queryOptions } from "@tanstack/react-query";
import { getCreateAccountFormDataResult } from "@/lib/server-actions/account-actions";

export const accountFormKeys = {
  data: (userId) => ["account-form-data", String(userId)],
};

export function accountFormOptions(userId) {
  return queryOptions({
    queryKey: accountFormKeys.data(userId),
    queryFn: async () => {
      const result = await getCreateAccountFormDataResult();
      if (!Array.isArray(result?.roles) || !Array.isArray(result?.courses) || !Array.isArray(result?.departments)) {
        throw new Error(result?.error || "Could not load account form options.");
      }
      return result;
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
