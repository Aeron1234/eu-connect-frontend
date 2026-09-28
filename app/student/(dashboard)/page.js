import MapSmallContainer from "@/app/_components/MapSmallContainer";
import DtrTodayCard from "@/app/_components/DtrTodayCard";
import RecentActivityCard from "@/app/_components/RecentActivityCard";
import { getStudentDashboardData } from "@/lib/server-actions/dashboard-actions";
import { getDtrs } from "@/lib/server-actions/dtr-actions";

import { getMyActivityLogs } from "@/lib/server-actions/activity-logs-actions";
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
// import StudentDashboardDtrTable from "@/app/_components/StudentDashboardDtrTable";
import DtrTable from "@/app/_components/DtrTable";
import { Suspense } from "react";
import DtrRecordsSkeleton from "@/app/_components/DtrRecordsSkeleton";
import { ckb } from "date-fns/locale";

export const metadata = {
  title: "Student",
};

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

async function StudentDashboardPage({ searchParams }) {
  const sParams = await searchParams;
  const currentDtrPage = Number(sParams.d_page) || 1;

  const [activityLogs, dashboardRes, dtrData] = await Promise.all([
    getMyActivityLogs({ page: 1 }),
    getStudentDashboardData(),
    getDtrs(currentDtrPage),
  ]);

  const internshipData = dashboardRes?.internshipData || {};
  const dtrToday = dashboardRes?.dtrToday || {};
  const dtrStatus = dashboardRes?.dtrStatus?.status;
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
      {/* Today card */}
      <DtrTodayCard
        internshipData={internshipData}
        status={dtrStatus}
        dtrToday={dtrToday}
      />

      {/* Recent Time Records */}

      <Suspense fallback={<DtrRecordsSkeleton />}>
        <section className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-4">
            <span className="w-4 h-4 rounded-full border-2 border-primary-500 flex-shrink-0" />
            Recent Time Records
          </h3>
          <div className="">
            <DtrTable
              dtrs={dtrData?.dtrs || []}
              totalPages={dtrData?.totalPages}
              currentDtrPage={currentDtrPage}
            />
          </div>
        </section>
      </Suspense>

      {/* Activity + sidebar row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentActivityCard activities={activities} />
        </div>

        <div className="flex flex-col gap-5">
          <InternshipProgress
            accumulated_hours={internshipData?.accumulated_hours || 0}
            total_hours={internshipData?.total_hours || 0}
          />

          <div className="rounded-xl bg-white border border-stone-300 shadow-sm h-64 lg:h-full min-h-64">
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
    <div className="rounded-xl bg-primary-500 text-white p-5">
      <h3 className="text-sm font-semibold mb-4">Internship Progress</h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-white">Required Hours</span>
            <span className="text-white font-medium">
              {accumulated_hours.toFixed(1)}/{total_hours}
            </span>
          </div>
          <div className="h-2 rounded-full bg-primary-50/50 overflow-hidden">
            <div
              className="h-full bg-primary-50 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboardPage;
