import InternsSupervisedCard from "@/app/_components/InternsSupervisedCard";
import QuickActionsCard from "@/app/_components/QuickActionsCard";
import JobsPostedTable, { mapJobRow } from "@/app/_components/JobsPostedTable";
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
import { getMyActivityLogs } from "@/app/_services/general-actions";
import {
  getEmployerDashboardData,
  getPostedJobs,
} from "@/app/_services/employer-actions";
import { formatDistanceToNow } from "date-fns";
import { Suspense } from "react";
import JobsPostedTableSkeleton from "@/app/_components/JobsPostedTableSkeleton";

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

const statusMap = {
  pending: "pending",
  ongoing: "ongoing",
  finished: "completed",
  rejected: "rejected",
};

async function EmployerDashboardPage({ searchParams }) {
  const params = await searchParams;
  const currentJobPage = Number(params.j_page) || 1;

  // The aggregate endpoint only ever returns page 1 of posted jobs — if the
  // user navigated to a later page (j_page > 1), fetch that page directly
  // instead of relying on the aggregate.
  const [activityLogs, dashboardRes, jobsPageRes] = await Promise.all([
    getMyActivityLogs({ page: 1 }),
    getEmployerDashboardData(),
    currentJobPage > 1 ? getPostedJobs({ page: currentJobPage }) : null,
  ]);

  const interns = (dashboardRes?.interns || []).map((row) => ({
    id: row.student_id,
    name: `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Unknown",
    status: statusMap[row.status] || row.status,
    role: row.internship_position,
    program: row.course_name || "—",
    programShort: row.short_name || "",
    startDate: row.date_started,
    hoursCompleted: row.accumulated_hours ?? 0,
    hoursRequired: row.total_hours ?? 0,
    email: row.email,
  }));

  const jobsRes = currentJobPage > 1 ? jobsPageRes : dashboardRes?.postedJobs;
  const jobs = (jobsRes?.jobs || []).map(mapJobRow);

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <InternsSupervisedCard interns={interns} />
        </div>

        <div className="flex flex-col gap-5">
          <div className="lg:col-span-2">
            <RecentActivityCard activities={activities} />
          </div>

          <QuickActionsCard />
        </div>
      </div>

      <Suspense fallback={<JobsPostedTableSkeleton />} key={jobs}>
        <JobsPostedTable
          jobs={jobs}
          totalPages={jobsRes?.totalPages || 1}
          currentJobPage={currentJobPage}
        />
      </Suspense>
    </div>
  );
}

export default EmployerDashboardPage;
