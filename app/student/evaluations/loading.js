import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import TabBarSkeleton from "@/components/skeletons/TabBarSkeleton";
import EvaluationCriteriaSkeleton from "@/components/skeletons/EvaluationCriteriaSkeleton";

function EvaluationsLoading() {
  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <PageTitleSkeleton />

      <div className="space-y-2">
        <TabBarSkeleton tabs={4} />

        <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mt-2 mb-8">
          <EvaluationCriteriaSkeleton />
        </div>
      </div>
    </div>
  );
}

export default EvaluationsLoading;
