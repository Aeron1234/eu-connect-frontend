import PageTitle from "@/app/_components/PageTitle";
import { getUserSession } from "@/app/_services/auth";

// import { getUserSession } from "../../_services/auth";

async function StudentDashboardLayout({ dtr, stats, children }) {
  const session = await getUserSession();
  const user = session?.user;
  const role = session?.user?.role;

  if (!user || role !== "student") return null;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="space-y-6">
        {/* Title */}
        <PageTitle
          title={"Dashboard"}
          description={"Here's your OJT overview for today"}
        />

        {/* Recent Time Records */}
        {dtr}

        {/* Stat cards */}
        {stats}

        {/* Activity + Sidebar column */}
        {children}
      </div>
    </main>
  );
}

export default StudentDashboardLayout;
