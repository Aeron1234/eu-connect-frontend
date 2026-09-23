import RecentActivityCardSkeleton from "@/app/_components/RecentActivityCardSkeleton";
import ShiftHoursChartSkeleton from "@/app/_components/ShiftHoursChartSkeleton";
import InternshipsPerCourseChartSkeleton from "@/app/_components/InternshipsPerCourseChartSkeleton";
import EvaluationScoresChartSkeleton from "@/app/_components/EvaluationScoresChartSkeleton";
import HoursDistributionDonutSkeleton from "@/app/_components/HoursDistributionDonutSkeleton";
import StudentHoursTrackerSkeleton from "@/app/_components/StudentHoursTrackerSkeleton";

function DepartmentHeadDashboardLoading() {
  return (
    <div className="space-y-6">
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
