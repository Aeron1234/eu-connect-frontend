"use client";

import { CheckCircle2 } from "lucide-react";

export default function EvaluationEmptyState({ type }) {
  if (type === "confirmation")
    return (
      <div className="rounded-xl border border-dashed border-border shadow-sm bg-card px-6 py-12 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary-emphasis" />
        <p className="mt-3 text-base font-bold text-foreground">
          All caught up
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          You have no evaluations waiting for confirmation.
        </p>
      </div>
    );

  if (type === "all")
    return (
      <div className="rounded-xl border border-dashed border-border shadow-sm bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        No confirmed evaluations yet.
      </div>
    );

  if (type === "disputed")
    return (
      <div className="rounded-xl border border-dashed border-border shadow-sm bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        No disputed evaluations yet.
      </div>
    );

  return (
    <p className="rounded-xl border border-dashed border-border shadow-sm bg-card px-6 py-12 text-center text-sm text-muted-foreground">
      No past evaluations yet.
    </p>
  );

}
