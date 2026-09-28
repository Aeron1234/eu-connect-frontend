"use client";

import { useEffect, useRef, useState } from "react";
import EmployerEvaluations from "./EmployerEvaluations";
import EvaluationCard from "./EvaluationCard";
import TabBar from "./TabBar";
import EvaluationsTabContentSkeleton from "./EvaluationsTabContentSkeleton";
import {
  getAllEvaluations,
  getDisputedEvaluations,
  getStudentPendingEvaluations,
} from "@/lib/server-actions/evaluations-actions";

import { getEmployerEvaluationCriterias } from "@/lib/server-actions/evaluations-actions";

const tabs = [
  { label: "Evaluate Supervisor", value: "evaluate-supervisor" },
  { label: "Pending Confirmation", value: "pending-confirmation" },
  { label: "Past Evaluations", value: "past-evaluations" },
  { label: "Disputed", value: "disputed" },
];

// TabBar expects { value, text } — this file's evaluation tabs use
// { value, label } — mapped once here rather than changing either
// component's expected shape.
const filterTabs = tabs.map((t) => ({ value: t.value, text: t.label }));

// Each tab pulls from a different endpoint with a different shape — this
// normalizes them all to { criteria } or { evaluations } so the render
// logic below stays simple.
const fetchers = {
  "evaluate-supervisor": async () => {
    const criteria = await getEmployerEvaluationCriterias();
    return { criteria: criteria || [] };
  },
  "pending-confirmation": async () => {
    const res = await getStudentPendingEvaluations();
    return { evaluations: res?.data || [] };
  },
  "past-evaluations": async () => {
    const res = await getAllEvaluations();
    return { evaluations: res?.data || [] };
  },
  disputed: async () => {
    const res = await getDisputedEvaluations();
    return { evaluations: res?.data || [] };
  },
};

function EvaluationsManager({ initialCriteria = [] }) {
  // Applied tab — drives what's actually fetched/rendered, only updates
  // after the debounce settles.
  const [filter, setFilter] = useState("evaluate-supervisor");
  // Selected tab — updates immediately on click so the active pill
  // highlights right away, even while the fetch is still debouncing.
  const [selectedTab, setSelectedTab] = useState("evaluate-supervisor");
  const [data, setData] = useState({ criteria: initialCriteria });
  const [isPending, setIsPending] = useState(false);

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  function handleTabClick(value) {
    setSelectedTab(value);
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (selectedTab === filter) return;

    const thisRequestId = ++requestIdRef.current;

    const timeout = setTimeout(async () => {
      setIsPending(true);
      try {
        const result = await fetchers[selectedTab]();

        if (thisRequestId !== requestIdRef.current) return;

        setFilter(selectedTab);
        setData(result);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error loading evaluations tab:", error);
          setFilter(selectedTab);
          setData({});
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsPending(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [selectedTab, filter]);

  return (
    <>
      <TabBar
        tabs={filterTabs}
        selectedTab={selectedTab}
        onSelect={handleTabClick}
      />

      <div className="flex flex-col gap-2 mt-2">
        {isPending ? (
          <EvaluationsTabContentSkeleton tab={selectedTab} />
        ) : (
          <>
            {filter === "evaluate-supervisor" && (
              <div className="bg-white rounded-xl border border-stone-300 shadow-sm p-4 sm:p-6 mb-8">
                <EmployerEvaluations
                  employerEvaluationCriterias={data?.criteria || []}
                />
              </div>
            )}
            {filter === "pending-confirmation" && (
              <EvaluationCard
                evaluations={data?.evaluations || []}
                type={"confirmation"}
              />
            )}
            {filter === "past-evaluations" && (
              <EvaluationCard
                evaluations={data?.evaluations || []}
                type={"all"}
              />
            )}
            {filter === "disputed" && (
              <EvaluationCard
                evaluations={data?.evaluations || []}
                type={"disputed"}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

export default EvaluationsManager;
