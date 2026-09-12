import { notFound, redirect } from "next/navigation";
import Header from "../_components/Header";
import SideNavigation from "../_components/SideNavigation";
import { getUserSession } from "../_services/auth";
import Alert from "../_components/Alert";
import SocketProvider from "../_components/SocketProvider";
import { UserProvider } from "@/contexts/UserContext";
import { SidebarProvider } from "@/contexts/SidebarContext";

export const dynamic = "force-dynamic";

async function AccountLayout({ children }) {
  const session = await getUserSession();
  if (!session?.user) return redirect("/login");

  return (
    <SocketProvider userId={session.user.id}>
      <UserProvider initialUser={session?.user ?? null}>
        <SidebarProvider>
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] h-screen overflow-hidden antialiased text-stone-800">
            <SideNavigation />

            <main className="flex flex-col min-w-0 h-screen overflow-hidden bg-stone-100 w-full">
              <div className="px-6 py-1 flex items-center w-full bg-white/50 backdrop-blur-sm text-stone-800 h-16 border-b border-stone-300 z-30">
                <Header />
                <Alert />
              </div>

              <div className="flex-1 overflow-y-auto">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      </UserProvider>
    </SocketProvider>
  );
}

export default AccountLayout;
