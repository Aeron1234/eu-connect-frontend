import { notFound } from "next/navigation";
import Header from "../_components/Header";
import SideNavigation from "../_components/SideNavigation";
import { getUserSession } from "../_services/services";

async function AdminLayout({ children }) {
  const session = await getUserSession();
  if (!session?.user) return notFound();

  const role = session.user.role;
  if (role !== "admin") return notFound();
  // mx-auto max-w-7xl

  return (
    <div className="relative grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] max-md:grid-rows-[auto_1fr_auto] max-lg:grid-cols-1 h-screen antialiased text-stone-800 overflow-x-hidden">
      <header className="col-span-2 px-2 py-1 flex items-center w-full bg-white/50 backdrop-blur-sm text-stone-800 sticky top-0 h-16 z-10 border-b border-stone-300">
        <Header />
      </header>

      <SideNavigation />

      <main className="w-full h-full py-4 px-8 max-lg:px-4 grid bg-stone-100 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
