"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { dashboardOverviewKeys, dashboardOverviewOptions } from "@/lib/cache/dashboard-overview-queries";
import { socket } from "@/components/ui/SocketProvider";
import DashboardOverviewState from "@/components/dashboard-ui/DashboardOverviewState";
import PageTitle from "@/components/ui/PageTitle";
import DashboardStatsSection from "@/components/dashboard-ui/EmployerDashboardStats";
import EmployerProfileCard from "@/components/dashboard-ui/EmployerProfileCard";
import InternsSupervisedCard from "@/components/dashboard-ui/InternsSupervisedCard";
import QuickActionsCard from "@/components/dashboard-ui/QuickActionsCard";
import JobsPostedTable from "@/components/dashboard-ui/JobsPostedTable";
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

function EmployerDashboardPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!user?.id) return;
    const refreshSupervision = () => {
      void queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.role(user.id, "employer") });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", String(user.id), "employer-interns"] });
    };
    socket.on("supervisor_status_changed", refreshSupervision);
    return () => socket.off("supervisor_status_changed", refreshSupervision);
  }, [queryClient, user?.id]);
  const query = useQuery({
    ...dashboardOverviewOptions(user?.id, "employer"),
    enabled: Boolean(user?.id),
  });
  const dashboardRes = query.data?.overview;
  const activityLogs = query.data?.activity;
  if (!dashboardRes) return <DashboardOverviewState query={query} role="employer" />;

  const jobsRes = dashboardRes?.postedJobs;

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

      <EmployerProfileCard profile={query.data?.extra} />
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

      <JobsPostedTable initialPage={jobsRes} />
    </div>
  );
}

export default EmployerDashboardPage;
