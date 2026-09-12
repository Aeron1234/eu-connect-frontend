import UserGrowthChart from "@/app/_components/UserGrowthChart";
import UsersByRoleChart from "@/app/_components/UsersByRoleChart";
import InternshipsByDepartmentChart from "@/app/_components/InternshipsByDepartmentChart";
import RecentActivityCard from "@/app/_components/RecentActivityCard";
import {
  getUserGrowthOverTime,
  getUsersByRole,
  getOngoingInternshipsByDepartment,
  getRecentSystemActivity,
} from "@/app/_services/admin-actions";
import {
  ClipboardCheck,
  CheckCircle2,
  Sparkles,
  Bell,
  AlertCircle,
  FileUp,
  Trash2,
  Pin,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function getActivityVisual(action = "") {
  if (action.includes("document")) {
    if (action.includes("deleted"))
      return { icon: Trash2, color: "text-red-600" };
    if (action.includes("accepted"))
      return { icon: CheckCircle2, color: "text-emerald-600" };
    return { icon: FileUp, color: "text-emerald-600" };
  }
  if (action.includes("announcement")) {
    if (action.includes("deleted"))
      return { icon: Trash2, color: "text-red-600" };
    if (action.includes("pinned"))
      return { icon: Pin, color: "text-primary-500" };
    return { icon: Bell, color: "text-blue-600" };
  }
  if (action.includes("finished")) {
    return { icon: CheckCircle2, color: "text-emerald-600" };
  }
  if (action.includes("evaluation")) {
    return { icon: ClipboardCheck, color: "text-amber-600" };
  }
  if (action.includes("login") || action.includes("password")) {
    return { icon: AlertCircle, color: "text-amber-600" };
  }
  return { icon: Sparkles, color: "text-blue-600" };
}

async function AdminDashboardPage() {
  const [growthRes, rolesRes, departmentsRes, activityRes] = await Promise.all([
    getUserGrowthOverTime(),
    getUsersByRole(),
    getOngoingInternshipsByDepartment(),
    getRecentSystemActivity(),
  ]);

  const growthData = growthRes?.growth || [];

  const roleData = rolesRes?.roles || [];

  const departmentData = (departmentsRes?.departments || []).map((row) => ({
    department: row.department_code || row.department_name || "—",
    departmentName: row.department_name,
    interns: row.interns,
  }));

  const activities = (activityRes?.data || []).map((log) => {
    const { icon, color } = getActivityVisual(log.action);
    return {
      icon,
      color,
      title: log.description,
      time: formatDistanceToNow(new Date(log.created_at), { addSuffix: true }),
    };
  });

  return (
    <div className="space-y-6">
      <UserGrowthChart data={growthData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UsersByRoleChart data={roleData} />
        <InternshipsByDepartmentChart data={departmentData} />
      </div>

      <RecentActivityCard activities={activities} />
    </div>
  );
}

export default AdminDashboardPage;
