import ShiftHoursChart from "@/app/_components/ShiftHoursChart";
import InternshipsPerCourseChart from "@/app/_components/InternshipsPerCourseChart";
import RecentActivityCard from "@/app/_components/RecentActivityCard";
import {
  ClipboardCheck,
  CheckCircle2,
  Sparkles,
  Bell,
  AlertCircle,
  FileUp,
  Trash2,
  Pin,
} from "lucide-react";
import {
  getAvailableShiftHoursMonths,
  getAverageShiftHours,
  getOngoingInternshipsPerCourse,
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
  const [activityLogs, perCourseRes, monthsRes] = await Promise.all([
    getMyActivityLogs({ page: 1 }),
    getOngoingInternshipsPerCourse(),
    getAvailableShiftHoursMonths(),
  ]);

  const perCourseData = (perCourseRes?.courses || []).map((row) => ({
    course: row.short_name || row.course_name || "—",
    courseName: row.course_name,
    interns: row.interns,
  }));

  const availableMonths =
    monthsRes?.months?.length > 0
      ? monthsRes.months
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

      <RecentActivityCard activities={activities} />
    </div>
  );
}
export default DepartmentHeadDashboardPage;
