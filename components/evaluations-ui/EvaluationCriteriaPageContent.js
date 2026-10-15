"use client";

import { ClipboardList, X } from "lucide-react";
import ErrorUI from "@/components/ui/ErrorUI";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EvaluationCriteriaListSkeleton from "../skeletons/EvaluationCriteriaListSkeleton";
import EvaluationCriteriaToolbar from "./EvaluationCriteriaToolbar";
import EvaluationCriteriaSectionCard from "./EvaluationCriteriaSectionCard";
import AddCriteriaSection from "./AddCriteriaSection";
import useEvaluationCriteriaManager from "./useEvaluationCriteriaManager";

export default function EvaluationCriteriaPageContent({ initialCriteria }) {
  const {
    criteriaQuery, filter, error, setError, isSwitchingType, visibleSections,
    toolbarProps, sectionActions, sectionFormProps, confirmationProps,
  } = useEvaluationCriteriaManager(initialCriteria);

  return (
    <div className="space-y-6">
      <ConfirmDialog {...confirmationProps} />
      <EvaluationCriteriaToolbar {...toolbarProps} />

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {!isSwitchingType && criteriaQuery.error && criteriaQuery.data && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <span>{criteriaQuery.error.message || "Could not load evaluation criteria."}</span>
          <button type="button" onClick={() => criteriaQuery.refetch()} className="font-semibold text-primary-emphasis hover:underline">Try again</button>
        </div>
      )}

      {isSwitchingType ? (
        <EvaluationCriteriaListSkeleton />
      ) : criteriaQuery.error && !criteriaQuery.data ? (
        <ErrorUI error={criteriaQuery.error} reset={() => void criteriaQuery.refetch()} logError={false} />
      )
      : (
        <>
          <div className="space-y-4">
            {visibleSections.map((section) => (
              <EvaluationCriteriaSectionCard key={section.id} section={section} {...sectionActions} />
            ))}

            {visibleSections.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
                <ClipboardList className="size-8 text-foreground-faint" />
                <p className="text-sm text-muted-foreground">
                  {filter === "all"
                    ? "No criteria yet. Add your first section below."
                    : `No ${filter} criteria found.`}
                </p>
              </div>
            )}
          </div>

          {/* Add section (local placeholder — persists once its first criterion is added) */}
          <AddCriteriaSection {...sectionFormProps} />
        </>
      )}
    </div>
  );
}
