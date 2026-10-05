import { redirect } from "next/navigation";
import Header from "@/components/ui/Header";
import SideNavigation from "@/components/ui/SideNavigation";
import SocketProvider from "@/components/ui/SocketProvider";
import Alert from "@/components/ui/Alert";
import { UserProvider } from "@/contexts/UserContext";
import { getUserSession } from "@/lib/server-actions/auth";

export default async function HelpLayout({ children }) {
  const session = await getUserSession();
  if (!session?.user) redirect("/login");

  return (
    <SocketProvider>
      <UserProvider initialUser={session.user}>
        <div className="grid h-screen grid-cols-1 overflow-hidden text-foreground antialiased lg:grid-cols-[auto_1fr]">
          <SideNavigation />
          <main className="flex h-screen min-w-0 flex-col overflow-hidden bg-canvas">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-border/70 bg-card/70 px-4 py-1 backdrop-blur-2xl sm:px-6 lg:px-8">
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
