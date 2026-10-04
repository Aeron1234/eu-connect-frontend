import { Briefcase, Megaphone, Users, FolderOpen } from "lucide-react";
import DashboardStats from "@/components/dashboard-ui/DashboardStats";

function EmployerDashboardStats({ stats: dashboardStats }) {
  const stats = [
    {
      label: "Internship Posts",
      value: dashboardStats?.internshipPosts ?? 0,
      icon: Briefcase,
      accent: "bg-primary text-white border border-primary-400",
      valueClass: "text-primary-foreground",
      labelClass: "text-primary-foreground/80",
    },
    {
      label: "Unread Announcements",
      value: dashboardStats?.unreadAnnouncements ?? 0,
      icon: Megaphone,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
    {
      label: "Interns Handled",
      value: `${dashboardStats?.internsHandled?.current ?? 0} current · ${dashboardStats?.internsHandled?.past ?? 0} past`,
      icon: Users,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
      small: true,
    },
    {
      label: "Documents Uploaded",
      value: dashboardStats?.documentsUploaded ?? 0,
      icon: FolderOpen,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default EmployerDashboardStats;
