import { Briefcase, ClipboardCheck, FolderOpen, Megaphone } from "lucide-react";
import { getStudentDashboardStats } from "../../../_services/services";

async function StatsPage() {
  const getStats = await getStudentDashboardStats();

  const stats = [
    {
      label: "Applied Internships",
      value: getStats?.stats.appliedInternships || 0,
      icon: Briefcase,
      accent: "bg-primary-500 text-white border border-stone  -400",
      valueClass: "text-primary-foreground",
      labelClass: "text-primary-foreground/80",
    },
    {
      label: "Unread Announcements",
      value: getStats?.stats.unreadAnnouncements || 0,
      icon: Megaphone,
      accent: "bg-amber-50 text-amber-700 border border-amber-200",
      valueClass: "text-amber-700",
      labelClass: "text-amber-700/80",
    },
    {
      label: "Pending Evaluations",
      value: getStats?.stats.pendingEvaluations || 0,
      icon: ClipboardCheck,
      accent: "bg-blue-50 text-blue-700 border border-blue-200",
      valueClass: "text-blue-700",
      labelClass: "text-blue-700/80",
    },
    {
      label: "Documents Stored",
      value: getStats?.stats.documentsStored || 0,
      icon: FolderOpen,
      accent: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      valueClass: "text-emerald-700",
      labelClass: "text-emerald-700/80",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-xl p-4 ${s.accent} shadow-sm`}>
          <div className="flex items-center gap-2">
            <s.icon className="w-4 h-4 opacity-90" />
            <p className={`text-xs font-medium ${s.labelClass}`}>{s.label}</p>
          </div>
          <p className={`text-3xl font-bold mt-3 ${s.valueClass}`}>{s.value}</p>
        </div>
      ))}
    </section>
  );
}

export default StatsPage;
