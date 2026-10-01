import { Briefcase, Megaphone, Users, FolderOpen } from "lucide-react";
import { getEmployerDashboardStats } from "@/lib/server-actions/dashboard-actions";
import DashboardStats from "@/app/_components/DashboardStats";

export const metadata = {
  title: "Employer",
};

export const dynamic = "force-dynamic";

async function StatsPage() {
  const getStats = await getEmployerDashboardStats();

  const stats = [
    {
      label: "Internship Posts",
      value: getStats?.stats?.internshipPosts ?? 0,
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
      label: "Interns Handled",
      value: `${getStats?.stats?.internsHandled?.current ?? 0} current · ${getStats?.stats?.internsHandled?.past ?? 0} past`,
      icon: Users,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
      small: true,
    },
    {
      label: "Documents Uploaded",
      value: getStats?.stats?.documentsUploaded ?? 0,
      icon: FolderOpen,
      accent: "bg-card text-primary-emphasis border border-border",
      valueClass: "text-foreground",
      labelClass: "text-primary-emphasis",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StatsPage;
