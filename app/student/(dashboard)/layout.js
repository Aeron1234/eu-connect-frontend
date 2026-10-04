import { getUserSession } from "@/lib/server-actions/auth";

async function DashboardLayout({ children }) {
  const session = await getUserSession();
  const user = session?.user;
  const role = session?.user?.role;

  if (!user || role !== "student") return null;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
  );
}

export default DashboardLayout;
