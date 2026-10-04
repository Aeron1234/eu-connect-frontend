import { getUserSession } from "@/lib/server-actions/auth";

async function AdminDashboardLayout({ children }) {
  const session = await getUserSession();
  const role = session?.user?.role;

  if (!session?.user || role !== "admin") return null;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
  );
}

export default AdminDashboardLayout;
