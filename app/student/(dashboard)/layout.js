import {
  Sparkles,
  CheckCircle2,
  Bell,
  AlertCircle,
  FileUp,
} from "lucide-react";
import { getUserSession } from "../../_services/services";
import { notFound } from "next/navigation";

const activities = [
  {
    icon: CheckCircle2,
    color: "text-emerald-600",
    title: "Application submitted to ABC Corporation",
    time: "2 hours ago",
  },
  {
    icon: Bell,
    color: "text-blue-600",
    title: "New announcement: Submission deadline extended",
    time: "5 hours ago",
  },
  {
    icon: AlertCircle,
    color: "text-amber-600",
    title: "Evaluation form due in 3 days",
    time: "1 day ago",
  },
  {
    icon: FileUp,
    color: "text-emerald-600",
    title: "Document uploaded: OJT Endorsement Letter",
    time: "2 days ago",
  },
  {
    icon: Sparkles,
    color: "text-blue-600",
    title: "New internship posted: XYZ Tech Solutions",
    time: "3 days ago",
  },
];

const deadlines = [
  {
    title: "Weekly Journal Submission",
    date: "Jul 5, 2026",
    dot: "bg-primary",
  },
  {
    title: "Supervisor Evaluation Form",
    date: "Jul 10, 2026",
    dot: "bg-amber-500",
  },
  {
    title: "Mid-term Progress Report",
    date: "Jul 15, 2026",
    dot: "bg-blue-500",
  },
  {
    title: "OJT Completion Certificate",
    date: "Aug 1, 2026",
    dot: "bg-emerald-500",
  },
];

const progressBars = [
  { label: "Required Hours", value: "210/486", pct: 43 },
  { label: "Journal Entries", value: "9/20", pct: 45 },
  { label: "Evaluations Done", value: "1/3", pct: 33 },
];

async function layout({ dtr, stats }) {
  const session = await getUserSession();
  const user = session?.user;
  const role = session?.user?.role;

  if (!user || role !== "student") return null;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">
            Dashboard
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Here&apos;s your OJT overview for today
          </p>
        </div>

        {/* Recent Time Records */}
        {dtr}

        {/* Stat cards */}
        {stats}

        {/* Activity + Sidebar column */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent activity */}
          <div className="lg:col-span-2 rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-4">
              <Sparkles className="w-4 h-4 text-primary-500" />
              Recent Activity
            </h3>
            <ul className="divide-y divide-stone-300">
              {activities.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <a.icon className={`w-4 h-4 mt-0.5 ${a.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-stone-800">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-3">
                <span className="w-4 h-4 rounded-full border-2 border-primary" />
                Upcoming Deadlines
              </h3>
              <ul className="space-y-2.5">
                {deadlines.map((d) => (
                  <li
                    key={d.title}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${d.dot}`}
                      />
                      <span className="text-stone-800 truncate">{d.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {d.date}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-primary-500 text-white p-5">
              <h3 className="text-sm font-semibold mb-4">OJT Progress</h3>
              <div className="space-y-4">
                {progressBars.map((p) => (
                  <div key={p.label}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-white">{p.label}</span>
                      <span className="text-white font-medium">{p.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-primary-50/50 overflow-hidden">
                      <div
                        className="h-full bg-primary-50 rounded-full transition-all"
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Daily Narratives */}
      </div>
    </main>
  );
}

export default layout;
