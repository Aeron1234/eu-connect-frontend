import { getUserSession } from "@/lib/server-actions/auth";

async function EmployerDashboardLayout({ children }) {
  const session = await getUserSession();
  const user = session?.user;
  const role = session?.user?.role;

  if (!user || role !== "employer") return null;

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</div>
  );
}

export default EmployerDashboardLayout;
