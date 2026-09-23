import RecentActivityCardSkeleton from "@/app/_components/RecentActivityCardSkeleton";
import UserGrowthChartSkeleton from "@/app/_components/UserGrowthChartSkeleton";
import UsersByRoleChartSkeleton from "@/app/_components/UsersByRoleChartSkeleton";
import InternshipsByDepartmentChartSkeleton from "@/app/_components/InternshipsByDepartmentChartSkeleton";

function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
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
