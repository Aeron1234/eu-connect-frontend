import { Briefcase, ClipboardCheck, FolderOpen, Megaphone } from "lucide-react";
import { getStudentDashboardStats } from "@/lib/server-actions/dashboard-actions";
import DashboardStats from "@/components/dashboard-ui/DashboardStats";

async function StatsPage() {
  const getStats = await getStudentDashboardStats();

  const stats = [
    {
      label: "Favorite Internships",
      value: getStats?.stats?.favoriteInternships ?? 0,
      icon: Briefcase,
      accent: "bg-primary text-white border border-primary-400",
      valueClass: "text-primary-foreground",
      labelClass: "text-primary-foreground/80",
    },
    {
      label: "Unread Announcements",
      value: getStats?.stats?.unreadAnnouncements ?? 0,
      icon: Megaphone,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
    {
      label: "Pending Evaluations",
      value: getStats?.stats?.pendingEvaluations ?? 0,
      icon: ClipboardCheck,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
    {
      label: "Documents Stored",
      value: getStats?.stats?.documentsStored ?? 0,
      icon: FolderOpen,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StatsPage;
