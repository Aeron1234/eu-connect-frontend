import {
  Briefcase,
  FileText,
  MessageSquareText,
  Megaphone,
} from "lucide-react";
import DashboardStats from "@/app/_components/DashboardStats";
import { getDepartmentHeadDashboardStats } from "@/app/_services/dept-head-actions";

export const metadata = {
  title: "Department Head",
};

async function StatsPage() {
  const getStats = await getDepartmentHeadDashboardStats();

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
      label: "Internship Records",
      value: getStats?.stats?.internshipRecords ?? 0,
      icon: FileText,
      accent: "bg-amber-50 text-amber-700 border border-amber-200",
      valueClass: "text-amber-700",
      labelClass: "text-amber-700/80",
    },
    {
      label: "Pending Responses",
      value: getStats?.stats?.pendingResponses ?? 0,
      icon: MessageSquareText,
      accent: "bg-blue-50 text-blue-700 border border-blue-200",
      valueClass: "text-blue-700",
      labelClass: "text-blue-700/80",
    },
    {
      label: "Unread Announcements",
      value: getStats?.stats?.unreadAnnouncements ?? 0,
      icon: Megaphone,
      accent: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      valueClass: "text-emerald-700",
      labelClass: "text-emerald-700/80",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StatsPage;
