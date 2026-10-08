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

const tabs = [
  { value: "evaluate-supervisor", text: "Evaluate Supervisor" },
  { value: "pending-confirmation", text: "Pending Confirmation" },
  { value: "past-evaluations", text: "Past Evaluations" },
  { value: "disputed", text: "Disputed" },
];
const changedEvaluationTabs = ["pending-confirmation", "past-evaluations", "disputed"];

function EvaluationsManager({ initialCriteria = [] }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState("evaluate-supervisor");
  const [activeTab, setActiveTab] = useState("evaluate-supervisor");
  const tabQuery = useQuery({
    ...evaluationsTabOptions(user.id, activeTab),
    initialData: activeTab === "evaluate-supervisor"
      ? { criteria: initialCriteria }
      : undefined,
  });

  useEffect(() => {
    if (serverSnapshotRef.current === initialCriteria) return;
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
          <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-6 text-sm">
            <p>{loadError}</p>
            <button type="button" className="mt-3 font-semibold text-primary-emphasis" onClick={() => void tabQuery.refetch()}>Try again</button>
          </div>
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

export default EvaluationsManager;
