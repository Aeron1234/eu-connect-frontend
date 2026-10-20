"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { dashboardOverviewOptions } from "@/lib/cache/dashboard-overview-queries";
import DashboardOverviewState from "@/components/dashboard-ui/DashboardOverviewState";
import DashboardStatsSection from "@/components/dashboard-ui/StudentDashboardStats";
import MapSmallContainer from "@/components/map-ui/MapSmallContainer";
import DtrTodayCard from "@/components/dtr-ui/DtrTodayCard";
import RecentActivityCard from "@/components/dashboard-ui/RecentActivityCard";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatDistanceToNow } from "date-fns";
import {
  Sparkles,
  CheckCircle2,
  Bell,
  AlertCircle,
  FileUp,
  Trash2,
  Pin,
  ClipboardCheck,
} from "lucide-react";
import StudentDtrHistory from "@/components/dtr-ui/StudentDtrHistory";
import { Suspense } from "react";
import DtrRecordsSkeleton from "@/components/skeletons/DtrRecordsSkeleton";


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

function StudentDashboardPage() {
  const { user } = useUser();
  const query = useQuery({
    ...dashboardOverviewOptions(user?.id, "student"),
    enabled: Boolean(user?.id),
  });
  const dashboardRes = query.data?.overview;
  const activityLogs = query.data?.activity;
  if (!dashboardRes) return <DashboardOverviewState query={query} role="student" />;

  const internshipData = dashboardRes?.internshipData || {};
  const dtrToday = dashboardRes?.dtrToday || {};
  const dtrStatus = dashboardRes?.dtrStatus?.status;
  const dtrRecord = dashboardRes?.dtrStatus?.record;
  const locationData = dashboardRes?.location || {};

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-foreground-soft mt-1">
          Here&apos;s your OJT overview for today
        </p>
      </div>

      <DashboardStatsSection data={query.data?.extra} />

      {/* Today card */}
      <DtrTodayCard
        internshipData={internshipData}
        status={dtrStatus}
        dtrRecord={dtrRecord}
        dtrToday={dtrToday}
      />

      {/* Recent Time Records */}

      <Suspense fallback={<DtrRecordsSkeleton />}>
        <section className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
            <span className="w-4 h-4 rounded-full border-2 border-primary flex-shrink-0" />
            Recent Time Records
          </h3>
          <div className="min-w-0">
            <StudentDtrHistory internshipId={internshipData?.id} />
          </div>
        </section>
      </Suspense>

      {/* Activity + sidebar row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="order-2 min-w-0 self-start lg:order-1 lg:col-span-2 lg:self-stretch">
          <RecentActivityCard activities={activities} />
        </div>

        <div className="order-1 flex min-w-0 flex-col gap-5 lg:order-2">
          <InternshipProgress
            accumulated_hours={internshipData?.accumulated_hours || 0}
            total_hours={internshipData?.total_hours || 0}
          />

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <MapSmallContainer
              latitude={locationData?.lat || 0}
              longitude={locationData?.lon || 0}
              radius={locationData?.radius_meters || 100}
              label={locationData?.label || ""}
              address={locationData?.address || ""}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function InternshipProgress({ accumulated_hours = 0, total_hours = 0 }) {
  const pct = Math.min(
    100,
    Math.round((accumulated_hours / total_hours) * 100),
  );
  return (
    <div className="rounded-xl bg-primary text-white p-5">
      <h3 className="text-sm font-semibold mb-4">Internship Progress</h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-white">Required Hours</span>
            <span className="text-white font-medium">
              {accumulated_hours.toFixed(1)}/{total_hours}
            </span>
          </div>
          <ProgressBar value={pct} label="Internship hours completed" onBrand />
        </div>
      </div>
    </div>
  );
}

export default StudentDashboardPage;
