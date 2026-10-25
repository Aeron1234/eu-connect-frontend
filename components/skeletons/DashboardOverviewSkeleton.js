import { Skeleton } from "@/components/ui/skeleton";
import DashboardStatsSkeleton from "./DashboardStatsSkeleton";
import DtrRecordsSkeleton from "./DtrRecordsSkeleton";
import EvaluationScoresChartSkeleton from "./EvaluationScoresChartSkeleton";
import HoursDistributionDonutSkeleton from "./HoursDistributionDonutSkeleton";
import InternshipsByDepartmentChartSkeleton from "./InternshipsByDepartmentChartSkeleton";
import InternshipsPerCourseChartSkeleton from "./InternshipsPerCourseChartSkeleton";
import InternsSupervisedCardSkeleton from "./InternsSupervisedCardSkeleton";
import JobsPostedTableSkeleton from "./JobsPostedTableSkeleton";
import QuickActionsCardSkeleton from "./QuickActionsCardSkeleton";
import RecentActivityCardSkeleton from "./RecentActivityCardSkeleton";
import ShiftHoursChartSkeleton from "./ShiftHoursChartSkeleton";
import StudentHoursTrackerSkeleton from "./StudentHoursTrackerSkeleton";
import UserGrowthChartSkeleton from "./UserGrowthChartSkeleton";
import UsersByRoleChartSkeleton from "./UsersByRoleChartSkeleton";

function DashboardHeadingSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-40 max-w-full" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
  );
}

function PanelSkeleton({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

function StudentDashboardSkeleton() {
  return (
    <>
      <DashboardStatsSkeleton />
      <PanelSkeleton>
        <Skeleton className="h-4 w-32" />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </PanelSkeleton>
      <PanelSkeleton>
        <Skeleton className="mb-4 h-4 w-40" />
        <DtrRecordsSkeleton embedded allowDelete />
      </PanelSkeleton>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="order-2 lg:order-1 lg:col-span-2">
          <RecentActivityCardSkeleton />
        </div>
        <div className="order-1 flex flex-col gap-5 lg:order-2">
          <div className="rounded-xl bg-primary p-5">
            <Skeleton className="h-4 w-36 bg-white/30" />
            <Skeleton className="mt-5 h-3 w-full bg-white/30" />
            <Skeleton className="mt-2 h-2 w-full rounded-full bg-white/30" />
          </div>
          <Skeleton className="min-h-64 w-full rounded-xl" />
        </div>
      </div>
    </>
  );
}

function EmployerDashboardSkeleton() {
  return (
    <>
      <PanelSkeleton>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-4 w-64 max-w-full" />
      </PanelSkeleton>
      <DashboardStatsSkeleton count={3} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><InternsSupervisedCardSkeleton /></div>
        <div className="flex flex-col gap-5">
          <RecentActivityCardSkeleton />
          <QuickActionsCardSkeleton />
        </div>
      </div>
      <JobsPostedTableSkeleton />
    </>
  );
}

function DepartmentHeadDashboardSkeleton() {
  return (
    <>
      <DashboardStatsSkeleton />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ShiftHoursChartSkeleton />
        <InternshipsPerCourseChartSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <EvaluationScoresChartSkeleton />
        <EvaluationScoresChartSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <HoursDistributionDonutSkeleton />
        <StudentHoursTrackerSkeleton />
      </div>
      <RecentActivityCardSkeleton />
    </>
  );
}

function AdminDashboardSkeleton() {
  return (
    <>
      <DashboardStatsSkeleton />
      <UserGrowthChartSkeleton />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UsersByRoleChartSkeleton />
        <InternshipsByDepartmentChartSkeleton />
      </div>
      <RecentActivityCardSkeleton />
    </>
  );
}

export default function DashboardOverviewSkeleton({ role }) {
  return (
    <div role="status" aria-label="Loading dashboard" className="space-y-6">
      <DashboardHeadingSkeleton />
      {role === "student" ? <StudentDashboardSkeleton />
        : role === "employer" ? <EmployerDashboardSkeleton />
          : role === "department_head" ? <DepartmentHeadDashboardSkeleton />
            : <AdminDashboardSkeleton />}
    </div>
  );
}
