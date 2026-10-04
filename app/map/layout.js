import { notFound, redirect } from "next/navigation";
import Header from "../../components/ui/Header";
import SideNavigation from "../../components/ui/SideNavigation";
import { getUserSession } from "../../lib/server-actions/auth";
import SocketProvider from "../../components/ui/SocketProvider";
import Alert from "../../components/ui/Alert";
import { UserProvider } from "@/contexts/UserContext";

async function MapLayout({ children }) {
  const session = await getUserSession();
  if (!session?.user) return redirect("/login");

  if (!["department_head", "admin"].includes(session.user.role))
    return notFound();

  return (
    <SocketProvider>
      <UserProvider initialUser={session?.user ?? null}>
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] h-screen overflow-hidden antialiased text-foreground">
          <SideNavigation />

          <main className="flex flex-col min-w-0 h-screen overflow-hidden bg-canvas w-full">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-border/70 bg-card/70 px-4 py-1 text-foreground backdrop-blur-2xl sm:px-6 lg:px-8">
                <Header />
                <Alert />
              </div>

              {children}
            </div>
          </main>
        </div>
      </UserProvider>
    </SocketProvider>
  );
}

export default MapLayout;
