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

export const dynamic = "force-dynamic";

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
      accent: "bg-white text-primary-500 border border-stone-300",
      valueClass: "text-foreground",
      labelClass: "text-primary-500",
    },
    {
      label: "Pending Responses",
      value: getStats?.stats?.pendingResponses ?? 0,
      icon: MessageSquareText,
      accent: "bg-white text-primary-500 border border-stone-300",
      valueClass: "text-foreground",
      labelClass: "text-primary-500",
    },
    {
      label: "Unread Announcements",
      value: getStats?.stats?.unreadAnnouncements ?? 0,
      icon: Megaphone,
      accent: "bg-white text-primary-500 border border-stone-300",
      valueClass: "text-foreground",
      labelClass: "text-primary-500",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StatsPage;
