import { notFound, redirect } from "next/navigation";
import Header from "../_components/Header";
import SideNavigation from "../_components/SideNavigation";
import { getUserSession } from "../../lib/server-actions/auth";
import SocketProvider from "../_components/SocketProvider";
import Alert from "../_components/Alert";
import { UserProvider } from "@/contexts/UserContext";

async function NotificationsLayout({ children }) {
  const session = await getUserSession();
  if (!session?.user) return redirect("/login");

  return (
    <SocketProvider>
      <UserProvider initialUser={session?.user ?? null}>
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] h-screen overflow-hidden antialiased text-foreground">
          <SideNavigation />

          <main className="flex flex-col min-w-0 h-screen overflow-hidden bg-canvas w-full">
            <div className="px-4 sm:px-6 lg:px-8 py-1 flex items-center w-full bg-card/85 backdrop-blur-sm text-foreground h-16 border-b border-border z-30">
              <Header />
              <Alert />
            </div>

            <div className="flex-1 overflow-y-auto">{children}</div>
          </main>
        </div>
      </UserProvider>
    </SocketProvider>
  );
}

export default NotificationsLayout;
