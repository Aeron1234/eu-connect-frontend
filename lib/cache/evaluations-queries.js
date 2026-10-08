"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  getAllEvaluationsResult,
  getDisputedEvaluationsResult,
  getEmployerEvaluationCriteriasResult,
  getStudentPendingEvaluationsResult,
} from "@/lib/server-actions/evaluations-actions";

export const evaluationsKeys = {
  all: (userId) => ["evaluations", String(userId)],
  tab: (userId, tab) => [...evaluationsKeys.all(userId), tab],
};

const tabReaders = {
  "evaluate-supervisor": async () => {
    const result = await getEmployerEvaluationCriteriasResult();
    if (!Array.isArray(result)) {
      throw new Error(result?.error || "Could not load evaluation criteria.");
    }
    return { criteria: result };
  },
  "pending-confirmation": () => readEvaluations(getStudentPendingEvaluationsResult),
  "past-evaluations": () => readEvaluations(getAllEvaluationsResult),
  disputed: () => readEvaluations(getDisputedEvaluationsResult),
};

async function readEvaluations(action) {
  const result = await action();
  if (!Array.isArray(result?.data)) {
    throw new Error(result?.error || "Could not load evaluations.");
  }
  return { evaluations: result.data };
}

export function evaluationsTabOptions(userId, tab) {
  return queryOptions({
    queryKey: evaluationsKeys.tab(userId, tab),
    queryFn: tabReaders[tab],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
