"use client";

import { useState } from "react";
import { ClipboardList, Plus, RotateCcw, Trash2, X } from "lucide-react";
import IconBtn from "./CriteriaIconButton";
import EvaluationCriterionRow from "./EvaluationCriterionRow";

export default function EvaluationCriteriaSectionCard({
  section,
  isKeyPending,
  isMutationPending,
  onAddCriterion,
  onDeactivateCriterion,
  onReactivateCriterion,
  onDeactivateSection,
  onReactivateSection,
}) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const activeCount = section.items.filter((i) => i.is_active).length;
  const hasInactive = section.items.some((i) => !i.is_active);
  const isPersisted = section.items.length > 0;

  const submitNewCriterion = () => {
    if (!newLabel.trim()) return;
    onAddCriterion(section.title, newLabel.trim());
    setNewLabel("");
    setAdding(false);
  };

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 sm:px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <ClipboardList className="h-4 w-4 flex-shrink-0 text-primary-emphasis" />
          <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
            {section.title}
          </h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-primary-emphasis whitespace-nowrap">
            {activeCount} active criteria
          </span>
          {!isPersisted && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600 whitespace-nowrap">
              Unsaved
            </span>
          )}
        </div>

        {isPersisted && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {hasInactive && (
              <IconBtn
                title="Reactivate all inactive criteria in this section"
                disabled={isMutationPending}
                pending={isKeyPending(`reactivate-section:${section.title}`)}
                onClick={() => onReactivateSection(section.title)}
              >
                <RotateCcw className="h-4 w-4" />
              </IconBtn>
            )}
            {activeCount > 0 && (
              <IconBtn
                title="Deactivate all criteria in this section"
                danger
                disabled={isMutationPending}
                pending={isKeyPending(`section:${section.title}`)}
                onClick={() => onDeactivateSection(section.title)}
              >
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            )}
          </div>
        )}
      </header>

      <ul className="divide-y divide-border">
        {section.items.map((item) => (
          <EvaluationCriterionRow
            key={item.id}
            item={item}
            isKeyPending={isKeyPending}
            isMutationPending={isMutationPending}
            onDeactivateCriterion={onDeactivateCriterion}
            onReactivateCriterion={onReactivateCriterion}
          />
        ))}

        {section.items.length === 0 && !adding && (
          <li className="px-4 sm:px-5 py-4 text-sm text-muted-foreground">
            No criteria in this section yet.
          </li>
        )}

        {adding && (
          <li className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3">
            <input
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitNewCriterion()}
              placeholder="Criterion description"
              className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={submitNewCriterion}
                disabled={isMutationPending}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                {isKeyPending(`add:${section.title}`) ? "Saving…" : "Save"}
              </button>
              <IconBtn
                title="Cancel"
                onClick={() => {
                  setNewLabel("");
                  setAdding(false);
                }}
              >
                <X className="h-4 w-4" />
              </IconBtn>
            </div>
          </li>
        )}
      </ul>

      {!adding && (
        <div className="border-t border-border px-4 sm:px-5 py-3">
          <button
            type="button"
            onClick={() => setAdding(true)}
            disabled={isMutationPending}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-emphasis hover:underline disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add criterion
          </button>
        </div>
      )}
    </section>
  );
}
