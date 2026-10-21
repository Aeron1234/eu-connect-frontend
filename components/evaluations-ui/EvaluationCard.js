"use client";

import PostedEvaluationItem from "./PostedEvaluationItem";
import EvaluationEmptyState from "./EvaluationEmptyState";
import useEvaluationItems from "./useEvaluationItems";
import { useUser } from "@/contexts/UserContext";

function EvaluationCard({ evaluations = [], type = "default", onChanged }) {
  const { items, removeItem, restoreItem } = useEvaluationItems(evaluations);
  const { user } = useUser();
  const visibleItems = user?.role === "student" ? items.filter(ev => ev.type !== "Performance Evaluation") : items;

  if (visibleItems.length === 0) return <EvaluationEmptyState type={type} />;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mb-8">
      <div className="space-y-3">
        {visibleItems.map((ev, i) => (
          <PostedEvaluationItem
            key={ev.id}
            ev={ev}
            defaultOpen={i === 0}
            type={type}
            onOptimisticRemove={() => removeItem(ev.id)}
            onOptimisticRestore={() => restoreItem(ev)}
            onChanged={onChanged}
          />
        ))}
      </div>
    </div>
  );
}

export default EvaluationCard;
