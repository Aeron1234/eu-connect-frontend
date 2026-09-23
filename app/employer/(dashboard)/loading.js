import RecentActivityCardSkeleton from "@/app/_components/RecentActivityCardSkeleton";
import InternsSupervisedCardSkeleton from "@/app/_components/InternsSupervisedCardSkeleton";
import QuickActionsCardSkeleton from "@/app/_components/QuickActionsCardSkeleton";
import JobsPostedTableSkeleton from "@/app/_components/JobsPostedTableSkeleton";

function EmployerDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <InternsSupervisedCardSkeleton />
        </div>

        <div className="flex flex-col gap-5">
          <div className="lg:col-span-2">
            <RecentActivityCardSkeleton />
          </div>

          <QuickActionsCardSkeleton />
        </div>
      </div>

      <JobsPostedTableSkeleton />
    </div>
  );
}

export default EmployerDashboardLoading;
