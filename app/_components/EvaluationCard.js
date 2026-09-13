"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import PostedEvaluationItem from "./PostedEvaluationItem";

function EvaluationCard({ evaluations = [], type = "default" }) {
  const [items, setItems] = useState(evaluations);

  // Re-sync if the parent ever hands us a genuinely new list (real refresh,
  // tab switch fetching new data, etc.)
  useEffect(() => {
    setItems(evaluations);
  }, [evaluations]);

  function removeItem(id) {
    setItems((prev) => prev.filter((ev) => ev.id !== id));
  }

  function restoreItem(ev) {
    setItems((prev) => [ev, ...prev]);
  }

  if (items.length === 0) {
    if (type === "confirmation")
      return (
        <div className="rounded-xl border border-dashed border-stone-300 shadow-sm bg-white px-6 py-12 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-primary-500" />
          <p className="mt-3 text-base font-bold text-stone-800">
            All caught up
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            You have no evaluations waiting for confirmation.
          </p>
        </div>
      );

    if (type === "all")
      return (
        <div className="rounded-xl border border-dashed border-stone-300 shadow-sm bg-white px-6 py-12 text-center text-sm text-muted-foreground">
          No confirmed evaluations yet.
        </div>
      );

    if (type === "disputed")
      return (
        <div className="rounded-xl border border-dashed border-stone-300 shadow-sm bg-white px-6 py-12 text-center text-sm text-muted-foreground">
          No disputed evaluations yet.
        </div>
      );

    return (
      <p className="rounded-xl border border-dashed border-stone-300 shadow-sm bg-white px-6 py-12 text-center text-sm text-muted-foreground">
        No past evaluations yet.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-stone-300 shadow-sm p-4 sm:p-6 mb-8">
      <div className="space-y-3">
        {items.map((ev, i) => (
          <PostedEvaluationItem
            key={ev.id}
            ev={ev}
            defaultOpen={i === 0}
            type={type}
            onOptimisticRemove={() => removeItem(ev.id)}
            onOptimisticRestore={() => restoreItem(ev)}
          />
        ))}
      </div>
    </div>
  );
}

export default EvaluationCard;
