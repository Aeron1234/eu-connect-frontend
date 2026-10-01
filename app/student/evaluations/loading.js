import PageTitleSkeleton from "@/app/_components/PageTitleSkeleton";
import TabBarSkeleton from "@/app/_components/TabBarSkeleton";
import EvaluationCriteriaSkeleton from "@/app/_components/EvaluationCriteriaSkeleton";

function EvaluationsLoading() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <PageTitleSkeleton />

      <div className="space-y-2">
        <TabBarSkeleton tabs={4} />

        <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mt-2 mb-8">
          <EvaluationCriteriaSkeleton />
        </div>
      </div>
    </main>
  );
}

export default EvaluationsLoading;
