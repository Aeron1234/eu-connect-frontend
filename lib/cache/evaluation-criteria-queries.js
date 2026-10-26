"use client";

import { queryOptions } from "@tanstack/react-query";
import { getAllEvaluationCriteriaResult } from "@/lib/server-actions/evaluations-actions";

// Cache criteria independently for each viewer and evaluation target type.
// Mutations should invalidate the matching type/family rather than mixing both rubrics.
export const evaluationCriteriaKeys = {
  all: (userId) => ["evaluation-criteria", String(userId)],
  type: (userId, type) => [...evaluationCriteriaKeys.all(userId), type],
};

export function evaluationCriteriaOptions(userId, type) {
  return queryOptions({
    queryKey: evaluationCriteriaKeys.type(userId, type),
    queryFn: async () => {
      const result = await getAllEvaluationCriteriaResult({ type });
      if (!Array.isArray(result)) {
        throw new Error(result?.error || "Could not load evaluation criteria.");
      }
      return result;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
