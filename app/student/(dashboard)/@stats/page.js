import { Briefcase, ClipboardCheck, FolderOpen, Megaphone } from "lucide-react";
import { getStudentDashboardStats } from "../../../_services/services";
import DashboardStats from "@/app/_components/DashboardStats";

async function StatsPage() {
  const getStats = await getStudentDashboardStats();

  const stats = [
    {
      label: "Favorite Internships",
      value: getStats?.stats.favoriteInternships ?? 0,
      icon: Briefcase,
      accent: "bg-primary-500 text-white border border-stone  -400",
      valueClass: "text-primary-foreground",
      labelClass: "text-primary-foreground/80",
    },
    {
      label: "Unread Announcements",
      value: getStats?.stats.unreadAnnouncements ?? 0,
      icon: Megaphone,
      accent: "bg-white text-primary-500 border border-stone-300",
      valueClass: "text-foreground",
      labelClass: "text-primary-500",
    },
    {
      label: "Pending Evaluations",
      value: getStats?.stats.pendingEvaluations ?? 0,
      icon: ClipboardCheck,
      accent: "bg-white text-primary-500 border border-stone-300",
      valueClass: "text-foreground",
      labelClass: "text-primary-500",
    },
    {
      label: "Documents Stored",
      value: getStats?.stats.documentsStored ?? 0,
      icon: FolderOpen,
      accent: "bg-white text-primary-500 border border-stone-300",
      valueClass: "text-foreground",
      labelClass: "text-primary-500",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StatsPage;
