import { Briefcase, FolderOpen, Megaphone, ClipboardList } from "lucide-react";
import DashboardStats from "@/components/dashboard-ui/DashboardStats";

function StudentDashboardStats({ data }) {
  const hasInternship = data?.stats?.hasOngoingInternship;
  const missing = data?.stats?.missingRequirements;
  // A finite zero is a completed requirement set. No ongoing internship and unavailable
  // data are separate display states rather than zero missing requirements.
  const hasCount = hasInternship === true && Number.isFinite(missing);

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
    {
      label: "Missing Requirements",
      value: hasCount ? missing : hasInternship === false ? "No ongoing internship" : "Unavailable",
      detail: hasCount ? "Current internship requirements still to complete" : hasInternship === false ? "Requirements are tracked per ongoing internship" : "Requirement count could not be loaded",
      href: "/student/storage",
      icon: ClipboardList,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
      small: !hasCount,
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StudentDashboardStats;
