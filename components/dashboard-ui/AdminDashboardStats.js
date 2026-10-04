import { Briefcase, Building2, Users, UserX } from "lucide-react";
import DashboardStats from "@/components/dashboard-ui/DashboardStats";

function AdminDashboardStats({ stats: dashboardStats }) {
  const stats = [
    {
      label: "Ongoing Internships",
      value: dashboardStats?.ongoingInternships ?? 0,
      icon: Briefcase,
      accent: "bg-primary text-white border border-primary-400",
      valueClass: "text-primary-foreground",
      labelClass: "text-primary-foreground/80",
    },
    {
      label: "Employers",
      value: dashboardStats?.employers ?? 0,
      icon: Building2,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
    {
      label: "Students",
      value: dashboardStats?.students ?? 0,
      icon: Users,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
    {
      label: "Inactive / Suspended",
      value: dashboardStats?.inactiveOrSuspended ?? 0,
      icon: UserX,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default AdminDashboardStats;
