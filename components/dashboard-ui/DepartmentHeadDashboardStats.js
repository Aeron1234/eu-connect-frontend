import {
  Briefcase,
  FileText,
  MessageSquareText,
  Megaphone,
} from "lucide-react";
import DashboardStats from "@/components/dashboard-ui/DashboardStats";

function DepartmentHeadDashboardStats({ stats: dashboardStats }) {
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
      label: "Internship Records",
      value: dashboardStats?.internshipRecords ?? 0,
      icon: FileText,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
    {
      label: "Pending Responses",
      value: dashboardStats?.pendingResponses ?? 0,
      icon: MessageSquareText,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
    {
      label: "Unread Announcements",
      value: dashboardStats?.unreadAnnouncements ?? 0,
      icon: Megaphone,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default DepartmentHeadDashboardStats;
