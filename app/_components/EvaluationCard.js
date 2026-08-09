import { CheckCircle2 } from "lucide-react";
import PostedEvaluationItem from "./PostedEvaluationItem";

function EvaluationCard({ evaluations = [], userId = "", type = "default" }) {
  if (evaluations.length === 0) {
    if (type === "confirmation")
      return (
        <div className="rounded-xl border border-dashed border-stone-200 shadow-sm bg-background px-6 py-12 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-primary-500" />
          <p className="mt-3 font-display text-base font-bold">All caught up</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You have no evaluations waiting for confirmation.
          </p>
        </div>
      );

    if (type === "all")
      return (
        <div className="rounded-xl border border-dashed border-stone-200 shadow-sm bg-background px-6 py-12 text-center text-sm text-muted-foreground">
          No confirmed evaluations yet.
        </div>
      );

    if (type === "disputed")
      return (
        <div className="rounded-xl border border-dashed border-stone-200 shadow-sm bg-background px-6 py-12 text-center text-sm text-muted-foreground">
          No disputed evaluations yet.
        </div>
      );

    return (
      <p className="rounded-xl border border-dashed border-stone-200 shadow-sm bg-background px-6 py-12 text-center text-sm text-muted-foreground">
        No past evaluations yet.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6 mb-8">
      <div className="space-y-3">
        {evaluations.map((ev, i) => (
          <PostedEvaluationItem
            key={ev.id}
            ev={ev}
            defaultOpen={i === 0}
            userId={userId}
            type={type}
          />
        ))}
      </div>
    </div>
  );
}

export default EvaluationCard;
