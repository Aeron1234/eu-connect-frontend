"use client";

import { useQuery } from "@tanstack/react-query";
import { activityDescription } from "@/lib/activity-log-display.mjs";
import { useUser } from "@/contexts/UserContext";
import { dashboardOverviewOptions } from "@/lib/cache/dashboard-overview-queries";
import DashboardOverviewState from "@/components/dashboard-ui/DashboardOverviewState";
import PageTitle from "@/components/ui/PageTitle";
import PageManual from "@/components/ui/PageManual";
import DashboardStatsSection from "@/components/dashboard-ui/DepartmentHeadDashboardStats";
import ShiftHoursChart from "@/components/dashboard-ui/ShiftHoursChart";
import InternshipsPerCourseChart from "@/components/dashboard-ui/InternshipsPerCourseChart";
import RecentActivityCard from "@/components/dashboard-ui/RecentActivityCard";
import EvaluationScoresChart from "@/components/dashboard-ui/EvaluationScoresChart";
import HoursDistributionDonut from "@/components/dashboard-ui/HoursDistributionDonut";
import StudentHoursTracker from "@/components/dashboard-ui/StudentHoursTracker";
import {
  ClipboardCheck,
  CheckCircle2,
  Sparkles,
  Bell,
  AlertCircle,
  FileUp,
  Trash2,
  Pin,
  UserCheck,
  Building2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";


function getActivityVisual(action = "") {
  if (action.includes("document")) {
    if (action.includes("deleted"))
      return { icon: Trash2, color: "text-red-600" };
    if (action.includes("accepted"))
      return { icon: CheckCircle2, color: "text-emerald-600" };
    return { icon: FileUp, color: "text-emerald-600" };
  }
  if (action.includes("announcement")) {
    if (action.includes("deleted"))
      return { icon: Trash2, color: "text-red-600" };
    if (action.includes("pinned"))
      return { icon: Pin, color: "text-primary-emphasis" };
    return { icon: Bell, color: "text-blue-600" };
  }
  if (action.includes("evaluation")) {
    return { icon: ClipboardCheck, color: "text-amber-600" };
  }
  if (action.includes("login") || action.includes("password")) {
    return { icon: AlertCircle, color: "text-amber-600" };
  }
  return { icon: Sparkles, color: "text-blue-600" };
}

function DepartmentHeadDashboardPage() {
  const { user } = useUser();
  const query = useQuery({
    ...dashboardOverviewOptions(user?.id, "department_head"),
    enabled: Boolean(user?.id),
  });
  const dashboardRes = query.data?.overview;
  const activityLogs = query.data?.activity;
  if (!dashboardRes) return <DashboardOverviewState query={query} role="department_head" />;

  const perCourseData = (dashboardRes?.ongoingPerCourse || []).map((row) => ({
    course: row.short_name || row.course_name || "—",
    courseName: row.course_name,
    interns: row.interns,
  }));

  const availableMonths =
    dashboardRes?.availableShiftHoursMonths?.length > 0
      ? dashboardRes.availableShiftHoursMonths
      : [{ month: new Date().getMonth() + 1, year: new Date().getFullYear() }];

  const defaultMonth = availableMonths[0];

  const activities = (activityLogs?.data || []).slice(0, 5).map((log) => {
    const { icon, color } = getActivityVisual(log.action);
    return {
      icon,
      color,
      title: activityDescription(log),
      time: formatDistanceToNow(new Date(log.created_at), { addSuffix: true }),
    };
  });

  const studentEvalScores = dashboardRes?.studentEvaluationAverages || [];
  const employerEvalScores = dashboardRes?.employerEvaluationAverages || [];
  const courses = dashboardRes?.hoursTracker?.courses || [];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Dashboard"
        titleAction={<PageManual page="dashboard" />}
        description="Overview of internships and student activity in your department."
      />

      <DashboardStatsSection stats={dashboardRes.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ShiftHoursChart
          initialMonths={availableMonths}
          initialSelectedMonth={defaultMonth}
        />
        <InternshipsPerCourseChart data={perCourseData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EvaluationScoresChart
          title="Student Evaluations"
          description="Average score per category, rated by employers/supervisors"
          icon={<UserCheck className="w-4 h-4 text-primary-emphasis" />}
          data={studentEvalScores}
        />
        <EvaluationScoresChart
          title="Employer Evaluations"
          description="Average score per category, rated by students"
          icon={<Building2 className="w-4 h-4 text-primary-emphasis" />}
          data={employerEvalScores}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <HoursDistributionDonut summary={dashboardRes?.hoursDistribution || []} />
        <StudentHoursTracker initialPage={dashboardRes?.hoursTracker} courses={courses} />
      </div>

      <RecentActivityCard activities={activities} />
    </div>
  );
}
export default DepartmentHeadDashboardPage;
