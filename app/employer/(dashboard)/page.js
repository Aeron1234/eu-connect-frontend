import { withReadErrorPage } from "@/lib/page-read-error";
import PageTitle from "@/components/ui/PageTitle";
import DashboardStatsSection from "@/components/dashboard-ui/EmployerDashboardStats";
import DashboardProfileSection from "./profile";
import InternsSupervisedCard from "@/components/dashboard-ui/InternsSupervisedCard";
import QuickActionsCard from "@/components/dashboard-ui/QuickActionsCard";
import JobsPostedTable, {
  mapJobRow,
} from "@/components/dashboard-ui/JobsPostedTable";
import RecentActivityCard from "@/components/dashboard-ui/RecentActivityCard";
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
import { getMyActivityLogs } from "@/lib/server-actions/activity-logs-actions";
import { getEmployerDashboardData } from "@/lib/server-actions/dashboard-actions";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";
export const metadata = { title: "Employer" };

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

async function EmployerDashboardPage({ searchParams }) {
  const params = await searchParams;
  const requestedJobPage = Number(params.j_page);
  const currentJobPage = Number.isSafeInteger(requestedJobPage) && requestedJobPage > 0 && requestedJobPage <= 1000000
    ? requestedJobPage
    : 1;

  const [profile, activityLogs, dashboardRes] = await Promise.all([
    DashboardProfileSection(),
    getMyActivityLogs({ page: 1 }),
    getEmployerDashboardData({ jobPage: currentJobPage }),
  ]);

  const jobsRes = dashboardRes?.postedJobs;
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
      <PageTitle
        title="Dashboard"
        description="Overview of your internship program and posted opportunities."
      />

      {profile}
      <DashboardStatsSection stats={dashboardRes.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <InternsSupervisedCard
            initialPage={{
              interns: dashboardRes?.interns || [],
              page: dashboardRes?.internsPagination?.page || 1,
              total: dashboardRes?.internsPagination?.total || 0,
              totalPages: dashboardRes?.internsPagination?.totalPages || 1,
            }}
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="lg:col-span-2">
            <RecentActivityCard activities={activities} />
          </div>

          <QuickActionsCard />
        </div>
      </div>

      <JobsPostedTable
        jobs={jobs}
        totalPages={jobsRes?.totalPages || 1}
        currentJobPage={jobsRes?.currentPage || currentJobPage}
      />
    </div>
  );
}

export default withReadErrorPage(EmployerDashboardPage);
