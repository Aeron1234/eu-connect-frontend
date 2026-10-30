import DashboardClient from "./DashboardClient";
import AnalyticsDashboard from '@/components/analytics-ui/AnalyticsDashboard';
import { getUserSession } from '@/lib/server-actions/auth';

export const metadata = { title: "Department Head" };

export default async function DepartmentHeadDashboardPage() {
  const session=await getUserSession();
  if(session?.user?.department_code==='REG')return <AnalyticsDashboard mode="registrar"/>;
  return <DashboardClient />;
}
