import RecentActivityCardSkeleton from "@/components/skeletons/RecentActivityCardSkeleton";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import DashboardStatsSkeleton from "@/components/skeletons/DashboardStatsSkeleton";
import EmployerProfileLoading from "./profile-loading";
import InternsSupervisedCardSkeleton from "@/components/skeletons/InternsSupervisedCardSkeleton";
import QuickActionsCardSkeleton from "@/components/skeletons/QuickActionsCardSkeleton";
import JobsPostedTableSkeleton from "@/components/skeletons/JobsPostedTableSkeleton";

function EmployerDashboardLoading() {
  return (
    <div className="space-y-6">
      <PageTitleSkeleton />
      <EmployerProfileLoading />
      <DashboardStatsSkeleton count={3} />

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
