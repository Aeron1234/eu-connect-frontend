import { Briefcase, FolderOpen, Megaphone } from "lucide-react";
import DashboardStats from "@/components/dashboard-ui/DashboardStats";

function StudentDashboardStats({ data }) {

  const stats = [
    {
      label: "Favorite Internships",
      value: data?.stats?.favoriteInternships ?? 0,
      icon: Briefcase,
      accent: "bg-primary text-white border border-primary-400",
      valueClass: "text-primary-foreground",
      labelClass: "text-primary-foreground/80",
    },
    {
      label: "Unread Announcements",
      value: data?.stats?.unreadAnnouncements ?? 0,
      icon: Megaphone,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
    {
      label: "Documents Stored",
      value: data?.stats?.documentsStored ?? 0,
      icon: FolderOpen,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StudentDashboardStats;
