"use client";

import CompanyEvaluations from "./CompanyEvaluations";
import EvaluationCard from "./EvaluationCard";
import TabBar from "../ui/TabBar";
import EvaluationsTabContentSkeleton from "../skeletons/EvaluationsTabContentSkeleton";
import ErrorUI from "@/components/ui/ErrorUI";
import useEvaluationsManager from "./useEvaluationsManager";
export { default as StudentEvaluationsHelp } from "./StudentEvaluationsHelp";

function EvaluationsManager({ initialCriteria }) {
  const {
    tabs,
    selectedTab,
    activeTab,
    tabQuery,
    handleTabClick,
    refreshEvaluations,
    loadError,
    isPending,
    data,
  } = useEvaluationsManager(initialCriteria);

  return (
    <>
      <TabBar tabs={tabs} selectedTab={selectedTab} onSelect={handleTabClick} />

      <div className="mt-2 flex flex-col gap-2">
        {loadError && !isPending ? (
          <ErrorUI
            error={tabQuery.error || new Error(loadError)}
            reset={() => void tabQuery.refetch()}
            logError={false}
          />
        ) : isPending ? (
          <EvaluationsTabContentSkeleton tab={selectedTab} />
        ) : (
          <>
            {activeTab === "evaluate-company" && (
              <div className="mb-8 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <CompanyEvaluations
                  companyEvaluationCriterias={data?.criteria || []}
                  onSubmitted={refreshEvaluations}
                />
              </div>
            )}
            {activeTab === "past-evaluations" && (
              <EvaluationCard
                evaluations={data?.evaluations || []}
                type="all"
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
