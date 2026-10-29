"use client";

import EvaluationCriteriaSkeleton from "@/components/skeletons/EvaluationCriteriaSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { getEvaluationPostingEligibilityResult } from "@/lib/server-actions/evaluations-actions";
import ErrorUI from "@/components/ui/ErrorUI";

// Check availability per viewer, evaluation direction and target student.
// Keep the form hidden while loading or after a failed check. This is a UI gate;
// the write endpoint rechecks ownership/assignment and the supervisor-feedback slot.
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
  // Start-date restrictions are separate from this active-slot/assignment check.
  if (query.isPending) return <div role="status" aria-label="Checking evaluation availability"><div aria-hidden="true"><EvaluationCriteriaSkeleton /></div></div>;
  if (query.isError) return <ErrorUI error={query.error} reset={() => void query.refetch()} compact logError={false} />;
  if (!query.data.can_post) return <p role="status" className="rounded-lg border border-border bg-muted p-4 text-sm text-foreground-soft">{query.data.message}</p>;
  return children;
}
