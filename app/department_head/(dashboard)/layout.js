import { getUserSession } from "@/lib/server-actions/auth";
import { redirect } from "next/navigation";

async function DepartmentHeadDashboardLayout({ children }) {
  const session = await getUserSession();
  const role = session?.user?.role;

  if (!session?.user || role !== "department_head") return null; // TODO: confirm actual role string

  const department = session?.user?.department_code;

  if (department === "REG") return redirect("/department_head/sipp-reports");

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
  );
}

export default DepartmentHeadDashboardLayout;
