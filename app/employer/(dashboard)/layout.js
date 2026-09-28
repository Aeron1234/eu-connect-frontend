import PageTitle from "@/app/_components/PageTitle";
import { getUserSession } from "@/lib/server-actions/auth";

// import { getUserSession } from "../../_services/auth";

async function EmployerDashboardLayout({ profile, stats, children }) {
  const session = await getUserSession();
  const user = session?.user;
  const role = session?.user?.role;

  if (!user || role !== "employer") return null;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="space-y-6">
        {/* Title */}
        <PageTitle
          title={"Dashboard"}
          description={
            "Overview of your internship program and posted opportunities."
          }
        />

        {/* Employer and company profile */}
        {profile}

        {/* Stat cards */}
        {stats}

        {/* Activity + Sidebar column */}
        {children}
      </div>
    </main>
  );
}

export default EmployerDashboardLayout;
