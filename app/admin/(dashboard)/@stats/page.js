import { Briefcase, Building2, Users, UserX } from "lucide-react";
import DashboardStats from "@/app/_components/DashboardStats";
import { getAdminDashboardStats } from "@/lib/server-actions/dashboard-actions";

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
      accent: "bg-white text-primary-500 border border-stone-300",
      valueClass: "text-foreground",
      labelClass: "text-primary-500",
    },
    {
      label: "Students",
      value: getStats?.stats?.students ?? 0,
      icon: Users,
      accent: "bg-white text-primary-500 border border-stone-300",
      valueClass: "text-foreground",
      labelClass: "text-primary-500",
    },
    {
      label: "Inactive / Suspended",
      value: getStats?.stats?.inactiveOrSuspended ?? 0,
      icon: UserX,
      accent: "bg-white text-primary-500 border border-stone-300",
      valueClass: "text-foreground",
      labelClass: "text-primary-500",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StatsPage;
