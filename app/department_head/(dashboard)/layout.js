import { getUserSession } from "@/lib/server-actions/auth";

async function DepartmentHeadDashboardLayout({ children }) {
  const session = await getUserSession();
  const role = session?.user?.role;

  if (!session?.user || role !== "department_head") return null; // The active role code is department_head; REG identifies the registrar office.

  const department = session?.user?.department_code;

  // The Registrar overview owns its responsive spacing; keep SIPP Reports linked.
  if (department === 'REG') return children;

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</div>
  );
}

export default DepartmentHeadDashboardLayout;
