import { notFound, redirect } from "next/navigation";
import Header from "../../components/ui/Header";
import StickyHeaderSurface from "@/components/ui/StickyHeaderSurface";
import SideNavigation from "../../components/ui/SideNavigation";
import { getUserSession } from "../../lib/server-actions/auth";
import SocketProvider from "../../components/ui/SocketProvider";
import Alert from "../../components/ui/Alert";
import { UserProvider } from "@/contexts/UserContext";

async function PastInternshipsLayout({ children }) {
  const session = await getUserSession();
  if (!session?.user) return redirect("/login");

  if (!["student", "department_head", "admin"].includes(session.user.role))
    return notFound();

  return (
    <SocketProvider>
      <UserProvider initialUser={session?.user ?? null}>
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] h-screen overflow-hidden antialiased text-foreground">
          <SideNavigation />

          <main className="flex flex-col min-w-0 h-screen overflow-hidden bg-canvas w-full">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <StickyHeaderSurface>
                <Header />
                <Alert />
              </StickyHeaderSurface>

              {children}
            </div>
          </main>
        </div>
      </UserProvider>
    </SocketProvider>
  );
}

export default PastInternshipsLayout;
