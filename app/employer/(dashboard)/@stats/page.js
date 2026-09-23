import { Briefcase, Megaphone, Users, FolderOpen } from "lucide-react";
import { getEmployerDashboardStats } from "@/app/_services/employer-actions";
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
      accent: "bg-primary-500 text-white border border-primary-400",
      valueClass: "text-primary-foreground",
      labelClass: "text-primary-foreground/80",
    },
    {
      label: "Unread Announcements",
      value: getStats?.stats?.unreadAnnouncements ?? 0,
      icon: Megaphone,
      accent: "bg-white text-primary-500 border border-stone-300",
      valueClass: "text-foreground",
      labelClass: "text-primary-500",
    },
    {
      label: "Interns Handled",
      value: `${getStats?.stats?.internsHandled?.current ?? 0} current · ${getStats?.stats?.internsHandled?.past ?? 0} past`,
      icon: Users,
      accent: "bg-white text-primary-500 border border-stone-300",
      valueClass: "text-foreground",
      labelClass: "text-primary-500",
      small: true,
    },
    {
      label: "Documents Uploaded",
      value: getStats?.stats?.documentsUploaded ?? 0,
      icon: FolderOpen,
      accent: "bg-white text-primary-500 border border-stone-300",
      valueClass: "text-foreground",
      labelClass: "text-primary-500",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StatsPage;
