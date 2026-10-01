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
      accent: "bg-primary text-white border border-primary-400",
      valueClass: "text-primary-foreground",
      labelClass: "text-primary-foreground/80",
    },
    {
      label: "Employers",
      value: getStats?.stats?.employers ?? 0,
      icon: Building2,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
    {
      label: "Students",
      value: getStats?.stats?.students ?? 0,
      icon: Users,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
    {
      label: "Inactive / Suspended",
      value: getStats?.stats?.inactiveOrSuspended ?? 0,
      icon: UserX,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StatsPage;
