import RecentActivityCardSkeleton from "@/components/skeletons/RecentActivityCardSkeleton";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import DashboardStatsSkeleton from "@/components/skeletons/DashboardStatsSkeleton";
import UserGrowthChartSkeleton from "@/components/skeletons/UserGrowthChartSkeleton";
import UsersByRoleChartSkeleton from "@/components/skeletons/UsersByRoleChartSkeleton";
import InternshipsByDepartmentChartSkeleton from "@/components/skeletons/InternshipsByDepartmentChartSkeleton";

function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <PageTitleSkeleton />
      <DashboardStatsSkeleton />

      <UserGrowthChartSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UsersByRoleChartSkeleton />
        <InternshipsByDepartmentChartSkeleton />
      </div>

      <RecentActivityCardSkeleton />
    </div>
  );
}

export default AdminDashboardLoading;
