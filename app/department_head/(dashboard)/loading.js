import { getUserSession } from '@/lib/server-actions/auth';
import AnalyticsSkeleton from '@/components/analytics-ui/AnalyticsSkeleton';
import RecentActivityCardSkeleton from "@/components/skeletons/RecentActivityCardSkeleton";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import DashboardStatsSkeleton from "@/components/skeletons/DashboardStatsSkeleton";
import ShiftHoursChartSkeleton from "@/components/skeletons/ShiftHoursChartSkeleton";
import InternshipsPerCourseChartSkeleton from "@/components/skeletons/InternshipsPerCourseChartSkeleton";
import EvaluationScoresChartSkeleton from "@/components/skeletons/EvaluationScoresChartSkeleton";
import HoursDistributionDonutSkeleton from "@/components/skeletons/HoursDistributionDonutSkeleton";
import StudentHoursTrackerSkeleton from "@/components/skeletons/StudentHoursTrackerSkeleton";

async function DepartmentHeadDashboardLoading() {
  const session=await getUserSession();
  if(session?.user?.department_code==='REG')return <AnalyticsSkeleton/>;
  return (
    <div className="space-y-6">
      <PageTitleSkeleton />
      <DashboardStatsSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ShiftHoursChartSkeleton />
        <InternshipsPerCourseChartSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EvaluationScoresChartSkeleton />
        <EvaluationScoresChartSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <HoursDistributionDonutSkeleton />
        <StudentHoursTrackerSkeleton />
      </div>

      <RecentActivityCardSkeleton />
    </div>
  );
}

export default DepartmentHeadDashboardLoading;
