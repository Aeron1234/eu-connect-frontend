import {
  Briefcase,
  FileText,
  MessageSquareText,
  Megaphone,
} from "lucide-react";
import DashboardStats from "@/app/_components/DashboardStats";
import { getDepartmentHeadDashboardStats } from "@/lib/server-actions/dashboard-actions";

export const metadata = {
  title: "Department Head",
};

export const dynamic = "force-dynamic";

async function StatsPage() {
  const getStats = await getDepartmentHeadDashboardStats();

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
      label: "Internship Records",
      value: getStats?.stats?.internshipRecords ?? 0,
      icon: FileText,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
    {
      label: "Pending Responses",
      value: getStats?.stats?.pendingResponses ?? 0,
      icon: MessageSquareText,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
    {
      label: "Unread Announcements",
      value: getStats?.stats?.unreadAnnouncements ?? 0,
      icon: Megaphone,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StatsPage;
