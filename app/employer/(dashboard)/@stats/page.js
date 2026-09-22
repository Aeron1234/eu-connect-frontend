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
      accent: "bg-amber-50 text-amber-700 border border-amber-200",
      valueClass: "text-amber-700",
      labelClass: "text-amber-700/80",
    },
    {
      label: "Interns Handled",
      value: `${getStats?.stats?.internsHandled?.current ?? 0} current · ${getStats?.stats?.internsHandled?.past ?? 0} past`,
      icon: Users,
      accent: "bg-blue-50 text-blue-700 border border-blue-200",
      valueClass: "text-blue-700",
      labelClass: "text-blue-700/80",
      small: true,
    },
    {
      label: "Documents Uploaded",
      value: getStats?.stats?.documentsUploaded ?? 0,
      icon: FolderOpen,
      accent: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      valueClass: "text-emerald-700",
      labelClass: "text-emerald-700/80",
    },
  ];

  return <DashboardStats stats={stats} />;
}

export default StatsPage;
