import { getUserSession } from "@/lib/server-actions/auth";

async function DashboardLayout({ stats, children }) {
  const session = await getUserSession();
  const user = session?.user;
  const role = session?.user?.role;

  if (!user || role !== "student") return null;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">
            Dashboard
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Here&apos;s your OJT overview for today
          </p>
        </div>

        {stats}

        {children}
      </div>
    </main>
  );
}

export default DashboardLayout;
