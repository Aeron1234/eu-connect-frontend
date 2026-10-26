import { getUserSession } from "@/lib/server-actions/auth";
import { redirect } from "next/navigation";

async function DepartmentHeadDashboardLayout({ children }) {
  const session = await getUserSession();
  const role = session?.user?.role;

  if (!session?.user || role !== "department_head") return null; // The active role code is department_head; REG identifies the registrar office.

  const department = session?.user?.department_code;

  // Registrar accounts enter SIPP Reports through the department-head role.
  if (department === "REG") return redirect("/department_head/sipp-reports");

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</div>
  );
}

export default DepartmentHeadDashboardLayout;
