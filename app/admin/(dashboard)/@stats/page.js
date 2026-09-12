import { Briefcase, Building2, Users, UserX } from "lucide-react";
import DashboardStats from "@/app/_components/DashboardStats";
import { getAdminDashboardStats } from "@/app/_services/admin-actions";

export const metadata = {
  title: "Admin",
};

async function StatsPage() {
  const getStats = await getAdminDashboardStats();

  const stats = [
    {
      label: "Ongoing Internships",
      value: getStats?.stats?.ongoingInternships ?? 0,
      icon: Briefcase,
      accent: "bg-primary-500 text-white border border-primary-400",
      valueClass: "text-primary-foreground",
      labelClass: "text-primary-foreground/80",
    },
    {
      label: "Employers",
      value: getStats?.stats?.employers ?? 0,
      icon: Building2,
      accent: "bg-amber-50 text-amber-700 border border-amber-200",
      valueClass: "text-amber-700",
      labelClass: "text-amber-700/80",
    },
    {
      label: "Students",
      value: getStats?.stats?.students ?? 0,
      icon: Users,
      accent: "bg-blue-50 text-blue-700 border border-blue-200",
      valueClass: "text-blue-700",
      labelClass: "text-blue-700/80",
    },
    {
      label: "Inactive / Suspended",
      value: getStats?.stats?.inactiveOrSuspended ?? 0,
      icon: UserX,
      accent: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      valueClass: "text-emerald-700",
      labelClass: "text-emerald-700/80",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StatsPage;
