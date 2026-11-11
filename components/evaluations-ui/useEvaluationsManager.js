"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { notifyReadError } from "@/lib/client-read-error";
import { evaluationsKeys, evaluationsTabOptions } from "@/lib/cache/evaluations-queries";

const tabs = [
  { value: "evaluate-company", text: "Evaluate Company" },
  { value: "past-evaluations", text: "Past Evaluations" },
];
const changedEvaluationTabs = ["past-evaluations"];
// Coordinate criteria/history tabs and their viewer-scoped queries.
// selectedTab updates immediately; activeTab waits 300 ms unless its data is cached.
export default function useEvaluationsManager(initialCriteria) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState("evaluate-company");
  const [activeTab, setActiveTab] = useState("evaluate-company");
  const tabQuery = useQuery({
    ...evaluationsTabOptions(user.id, activeTab),
    initialData: activeTab === "evaluate-company" && Array.isArray(initialCriteria)
      ? { criteria: initialCriteria }
      : undefined,
  });

  useEffect(() => {
    if (!Array.isArray(initialCriteria) || serverSnapshotRef.current === initialCriteria) return;
    serverSnapshotRef.current = initialCriteria;
    queryClient.setQueryData(
      evaluationsKeys.tab(user.id, "evaluate-company"),
      { criteria: initialCriteria },
    );
  }, [initialCriteria, queryClient, user.id]);

  useEffect(() => {
    if (selectedTab === activeTab) return;
    const timeout = setTimeout(() => setActiveTab(selectedTab), 300);
    return () => clearTimeout(timeout);
  }, [selectedTab, activeTab]);

  useEffect(() => {
    if (tabQuery.error && tabQuery.data) notifyReadError(tabQuery.error.message || "Could not load evaluations.");
  }, [tabQuery.error, tabQuery.data]);

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
  const loadError = !isSwitching && tabQuery.isError && !tabQuery.data
    ? tabQuery.error?.message || "Could not load evaluations."
    : "";
  const isPending = isSwitching || tabQuery.isPending;
  const data = tabQuery.data;
  return {
    tabs,
    selectedTab,
    activeTab,
    tabQuery,
    handleTabClick,
    refreshEvaluations,
    loadError,
    isPending,
    data,
  };
}
