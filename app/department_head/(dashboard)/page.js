import ShiftHoursChart from "@/app/_components/ShiftHoursChart";
import InternshipsPerCourseChart from "@/app/_components/InternshipsPerCourseChart";
import RecentActivityCard from "@/app/_components/RecentActivityCard";
import EvaluationScoresChart from "@/app/_components/EvaluationScoresChart";
import HoursDistributionDonut from "@/app/_components/HoursDistributionDonut";
import StudentHoursTracker from "@/app/_components/StudentHoursTracker";
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
import {
  getAverageShiftHours,
  getDepartmentHeadDashboardData,
} from "@/app/_services/dept-head-actions";
import { getMyActivityLogs } from "@/app/_services/general-actions";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

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
      return { icon: Pin, color: "text-primary-500" };
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

async function DepartmentHeadDashboardPage() {
  const [activityLogs, dashboardRes] = await Promise.all([
    getMyActivityLogs({ page: 1 }),
    getDepartmentHeadDashboardData(),
  ]);

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
  const weeksRes = await getAverageShiftHours({
    month: defaultMonth.month,
    year: defaultMonth.year,
  });

  const activities = (activityLogs?.data || []).slice(0, 5).map((log) => {
    const { icon, color } = getActivityVisual(log.action);
    return {
      icon,
      color,
      title: log.description,
      time: formatDistanceToNow(new Date(log.created_at), { addSuffix: true }),
    };
  });

  const studentEvalScores = dashboardRes?.studentEvaluationAverages || [];
  const employerEvalScores = dashboardRes?.employerEvaluationAverages || [];
  const students = dashboardRes?.hoursTracker?.students || [];
  const courses = dashboardRes?.hoursTracker?.courses || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ShiftHoursChart
          initialMonths={availableMonths}
          initialSelectedMonth={defaultMonth}
          initialWeeks={weeksRes?.weeks || []}
        />
        <InternshipsPerCourseChart data={perCourseData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EvaluationScoresChart
          title="Student Evaluations"
          description="Average score per category, rated by employers/supervisors"
          icon={<UserCheck className="w-4 h-4 text-primary-500" />}
          data={studentEvalScores}
        />
        <EvaluationScoresChart
          title="Employer Evaluations"
          description="Average score per category, rated by students"
          icon={<Building2 className="w-4 h-4 text-primary-500" />}
          data={employerEvalScores}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <HoursDistributionDonut students={students} />
        <StudentHoursTracker students={students} courses={courses} />
      </div>

      <RecentActivityCard activities={activities} />
    </div>
  );
}
export default DepartmentHeadDashboardPage;
