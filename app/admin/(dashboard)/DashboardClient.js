"use client";

import { useQuery } from "@tanstack/react-query";
import { activityDescription } from "@/lib/activity-log-display.mjs";
import { useUser } from "@/contexts/UserContext";
import { dashboardOverviewOptions } from "@/lib/cache/dashboard-overview-queries";
import DashboardOverviewState from "@/components/dashboard-ui/DashboardOverviewState";
import PageTitle from "@/components/ui/PageTitle";
import PageManual from "@/components/ui/PageManual";
import DashboardStatsSection from "@/components/dashboard-ui/AdminDashboardStats";
import UserGrowthChart from "@/components/dashboard-ui/UserGrowthChart";
import UsersByRoleChart from "@/components/dashboard-ui/UsersByRoleChart";
import InternshipsByDepartmentChart from "@/components/dashboard-ui/InternshipsByDepartmentChart";
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
  if (action.includes("finished")) {
    return { icon: CheckCircle2, color: "text-emerald-600" };
  }
  if (action.includes("evaluation")) {
    return { icon: ClipboardCheck, color: "text-amber-600" };
  }
  if (action.includes("login") || action.includes("password")) {
    return { icon: AlertCircle, color: "text-amber-600" };
  }
  return { icon: Sparkles, color: "text-blue-600" };
}

function AdminDashboardPage() {
  const { user } = useUser();
  const query = useQuery({
    ...dashboardOverviewOptions(user?.id, "admin"),
    enabled: Boolean(user?.id),
  });
  const dashboardRes = query.data?.overview;
  if (!dashboardRes) return <DashboardOverviewState query={query} role="admin" />;

  const growthData = dashboardRes?.userGrowth || [];

  const roleData = dashboardRes?.usersByRole || [];

  const departmentData = (dashboardRes?.ongoingByDepartment || []).map(
    (row) => ({
      department: row.department_code || row.department_name || "—",
      departmentName: row.department_name,
      interns: row.interns,
    }),
  );

  const activities = (dashboardRes?.recentActivity || []).map((log) => {
    const { icon, color } = getActivityVisual(log.action);
    return {
      icon,
      color,
      title: activityDescription(log),
      time: formatDistanceToNow(new Date(log.created_at), { addSuffix: true }),
    };
  });

  return (
    <div className="space-y-6">
      <PageTitle
        title="Dashboard"
        titleAction={<PageManual page="dashboard" />}
        description="System-wide overview of users, internships, and activity."
      />

      <DashboardStatsSection stats={dashboardRes.stats} />

      <UserGrowthChart data={growthData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UsersByRoleChart data={roleData} />
        <InternshipsByDepartmentChart data={departmentData} />
      </div>

      <RecentActivityCard activities={activities} />
    </div>
  );
}

export default AdminDashboardPage;
