import { notFound, redirect } from "next/navigation";
import Header from "../../components/ui/Header";
import StickyHeaderSurface from "@/components/ui/StickyHeaderSurface";
import SideNavigation from "../../components/ui/SideNavigation";
// import { getUserSession } from "../_services/services";
import SocketProvider from "../../components/ui/SocketProvider";
import Alert from "../../components/ui/Alert";
import { UserProvider } from "@/contexts/UserContext";
import { getUserSession } from "../../lib/server-actions/auth";

async function StudentLayout({ children }) {
  const session = await getUserSession();
  if (!session?.user) return redirect("/login");

  const role = session.user.role;
  if (role !== "student") return notFound();

  return (
    <SocketProvider>
      <UserProvider initialUser={session?.user ?? null}>
        <div className="fixed inset-0 grid min-h-0 grid-rows-[minmax(0,1fr)] grid-cols-1 lg:grid-cols-[auto_1fr] h-dvh overflow-clip antialiased text-foreground">
          <SideNavigation />

          <main className="flex flex-col min-w-0 min-h-0 h-full overflow-hidden bg-canvas w-full">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
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

export default StudentLayout;
