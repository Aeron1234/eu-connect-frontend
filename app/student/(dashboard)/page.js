import MapSmallContainer from "@/app/_components/MapSmallContainer";
import {
  getMySettedDtrLocation,
  getOngoingInternshipRecord,
} from "@/app/_services/services";
import { getMyActivityLogs } from "@/app/_services/general-actions";
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
import RecentActivityCard from "@/app/_components/RecentActivityCard";

export const metadata = {
  title: "Student",
};

export const dynamic = "force-dynamic";

// Maps the raw `action` string stored in activity_logs to an icon/color —
// nothing in the DB row carries visual info, so this has to be derived
// from the action name itself. Falls back to a generic icon for anything
// that doesn't match a known pattern, rather than guessing.
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

async function StudentDashboardPage() {
  const [internshipData, activityLogs, settedLocation] = await Promise.all([
    getOngoingInternshipRecord(),
    getMyActivityLogs({ page: 1 }),
    getMySettedDtrLocation(),
  ]);

  const locationData = settedLocation?.location || {};

  console.log(settedLocation);

  const activities = (activityLogs?.data || []).slice(0, 5).map((log) => {
    const { icon, color } = getActivityVisual(log.action);
    return {
      icon,
      color,
      title: log.description,
      time: formatDistanceToNow(new Date(log.created_at), { addSuffix: true }),
    };
  });

  <div className="lg:col-span-2 h-full">
    <RecentActivityCard activities={activities} />
  </div>;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Recent activity */}
      <div className="lg:col-span-2">
        <RecentActivityCard activities={activities} />
      </div>

      {/* Right column */}
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
              {accumulated_hours}/{total_hours}
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
