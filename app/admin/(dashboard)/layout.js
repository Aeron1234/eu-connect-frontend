import PageTitle from "@/app/_components/PageTitle";
import { getUserSession } from "@/app/_services/auth";

async function AdminDashboardLayout({ stats, children }) {
  const session = await getUserSession();
  const role = session?.user?.role;

  if (!session?.user || role !== "admin") return null;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="space-y-6">
        <PageTitle
          title={"Dashboard"}
          description={
            "System-wide overview of users, internships, and activity."
          }
        />

        {stats}

        {children}
      </div>
    </main>
  );
}

export default AdminDashboardLayout;
