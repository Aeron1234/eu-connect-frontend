"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { getEvaluationPostingEligibilityResult } from "@/lib/server-actions/evaluations-actions";
import ErrorUI from "@/components/ui/ErrorUI";

export default function EvaluationPostingGuard({ direction, studentId, children }) {
  const { user } = useUser();
  const query = useQuery({
    queryKey: ["evaluation-posting", user?.id, direction, studentId || "self"],
    queryFn: async () => {
      const result = await getEvaluationPostingEligibilityResult(direction, studentId);
      if (typeof result?.can_post !== "boolean") throw new Error(result?.error || "Could not check evaluation availability.");
      return result;
    },
    staleTime: 0, retry: false, enabled: Boolean(user?.id),
  });
  if (query.isPending) return <p role="status" className="py-3 text-sm text-muted-foreground">Checking evaluation availability...</p>;
  if (query.isError) return <ErrorUI error={query.error} reset={() => void query.refetch()} compact logError={false} />;
  if (!query.data.can_post) return <p role="status" className="rounded-lg border border-border bg-muted p-4 text-sm text-foreground-soft">{query.data.message}</p>;
  return children;
}
