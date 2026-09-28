import PageTitle from "@/app/_components/PageTitle";
import { getUserSession } from "@/lib/server-actions/auth";
import { redirect } from "next/navigation";

async function DepartmentHeadDashboardLayout({ stats, children }) {
  const session = await getUserSession();
  const role = session?.user?.role;

  if (!session?.user || role !== "department_head") return null; // TODO: confirm actual role string

  const department = session?.user?.department_code;

  if (department === "REG") return redirect("/department_head/sipp-reports");

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="space-y-6">
        <PageTitle
          title={"Dashboard"}
          description={
            "Overview of internships and student activity in your department."
          }
        />

        {stats}

        {children}
      </div>
    </main>
  );
}

export default DepartmentHeadDashboardLayout;
