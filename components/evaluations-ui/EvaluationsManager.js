"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { notifyReadError } from "@/lib/client-read-error";
import { evaluationsKeys, evaluationsTabOptions } from "@/lib/cache/evaluations-queries";
import EmployerEvaluations from "./EmployerEvaluations";
import EvaluationCard from "./EvaluationCard";
import TabBar from "../ui/TabBar";
import EvaluationsTabContentSkeleton from "../skeletons/EvaluationsTabContentSkeleton";
import ErrorUI from "@/components/ui/ErrorUI";
import ManualDialog from "@/components/ui/ManualDialog";

const tabs = [
  { value: "evaluate-supervisor", text: "Evaluate Supervisor" },
  { value: "pending-confirmation", text: "Pending Confirmation" },
  { value: "past-evaluations", text: "Past Evaluations" },
  { value: "disputed", text: "Disputed" },
];
const changedEvaluationTabs = ["pending-confirmation", "past-evaluations", "disputed"];

function EvaluationsManager({ initialCriteria }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState("evaluate-supervisor");
  const [activeTab, setActiveTab] = useState("evaluate-supervisor");
  const tabQuery = useQuery({
    ...evaluationsTabOptions(user.id, activeTab),
    initialData: activeTab === "evaluate-supervisor" && Array.isArray(initialCriteria)
      ? { criteria: initialCriteria }
      : undefined,
  });

  useEffect(() => {
    if (!Array.isArray(initialCriteria) || serverSnapshotRef.current === initialCriteria) return;
    serverSnapshotRef.current = initialCriteria;
    queryClient.setQueryData(
      evaluationsKeys.tab(user.id, "evaluate-supervisor"),
      { criteria: initialCriteria },
    );
  }, [initialCriteria, queryClient, user.id]);

  useEffect(() => {
    if (selectedTab === activeTab) return;
    const timeout = setTimeout(() => setActiveTab(selectedTab), 300);
    return () => clearTimeout(timeout);
  }, [selectedTab, activeTab]);

  useEffect(() => {
    if (tabQuery.error) notifyReadError(tabQuery.error.message || "Could not load evaluations.");
  }, [tabQuery.error]);

  function handleTabClick(value) {
    setSelectedTab(value);
    if (queryClient.getQueryData(evaluationsKeys.tab(user.id, value))) {
      setActiveTab(value);
    }
  }

  function refreshEvaluations() {
    for (const tab of changedEvaluationTabs) {
      void queryClient.invalidateQueries({ queryKey: evaluationsKeys.tab(user.id, tab) });
    }
  }

  const isSwitching = selectedTab !== activeTab;
  const loadError = !isSwitching && tabQuery.isError
    ? tabQuery.error?.message || "Could not load evaluations."
    : "";
  const isPending = isSwitching || tabQuery.isPending;
  const data = tabQuery.data;

  return (
    <>
      <TabBar tabs={tabs} selectedTab={selectedTab} onSelect={handleTabClick} />

      <div className="mt-2 flex flex-col gap-2">
        {loadError && !isPending ? (
          <ErrorUI error={tabQuery.error || new Error(loadError)} reset={() => void tabQuery.refetch()} logError={false} />
        ) : isPending ? (
          <EvaluationsTabContentSkeleton tab={selectedTab} />
        ) : (
          <>
            {activeTab === "evaluate-supervisor" && (
              <div className="mb-8 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <EmployerEvaluations
                  employerEvaluationCriterias={data?.criteria || []}
                  onSubmitted={refreshEvaluations}
                />
              </div>
            )}
            {activeTab === "pending-confirmation" && (
              <EvaluationCard
                evaluations={data?.evaluations || []}
                type="confirmation"
                onChanged={refreshEvaluations}
              />
            )}
            {activeTab === "past-evaluations" && (
              <EvaluationCard
                evaluations={data?.evaluations || []}
                type="all"
                onChanged={refreshEvaluations}
              />
            )}
            {activeTab === "disputed" && (
              <EvaluationCard
                evaluations={data?.evaluations || []}
                type="disputed"
                onChanged={refreshEvaluations}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

export function StudentEvaluationsHelp() {
  return (
    <ManualDialog title="How to use evaluations">
      <div className="space-y-4 text-sm leading-relaxed text-foreground">
        <p>Use the tabs to evaluate your supervisor and respond to evaluations about your work.</p>
        <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
          <li>In <strong>Evaluate Supervisor</strong>, review the 0–5 grade scale, choose a score for each criterion, add optional remarks, and select <strong>Submit Evaluation</strong>.</li>
          <li>In <strong>Pending Confirmation</strong>, open an evaluation from your supervisor to review its scores and comments. Select <strong>Accept &amp; Confirm</strong> if you agree, or <strong>Dispute</strong> if you need it reviewed.</li>
          <li>In <strong>Disputed</strong>, review a disputed evaluation. Use <strong>Restore</strong> if you want to return it to Pending Confirmation.</li>
          <li>In <strong>Past Evaluations</strong>, review earlier results. A confirmed performance evaluation may have a <strong>Print</strong> button.</li>
        </ol>
        <p className="text-foreground-soft">If you submitted an evaluation that is still pending, its trash icon lets you delete it.</p>
      </div>
    </ManualDialog>
  );
}

export default EvaluationsManager;
