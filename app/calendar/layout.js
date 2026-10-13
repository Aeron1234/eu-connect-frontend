import { redirect } from "next/navigation";
import Header from "@/components/ui/Header";
import StickyHeaderSurface from "@/components/ui/StickyHeaderSurface";
import SideNavigation from "@/components/ui/SideNavigation";
import Alert from "@/components/ui/Alert";
import SocketProvider from "@/components/ui/SocketProvider";
import { UserProvider } from "@/contexts/UserContext";
import { getUserSession } from "@/lib/server-actions/auth";

export const dynamic = "force-dynamic";

export default async function CalendarLayout({ children }) {
  const session = await getUserSession();
  if (!session?.user) redirect("/login");
  if (!["student", "employer", "department_head", "admin"].includes(session.user.role)) redirect("/login");

  return (
    <SocketProvider>
      <UserProvider initialUser={session.user}>
        <div className="grid h-screen grid-cols-1 overflow-hidden text-foreground antialiased lg:grid-cols-[auto_1fr]">
          <SideNavigation />
          <main className="flex h-screen min-w-0 flex-col overflow-hidden bg-canvas">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <StickyHeaderSurface><Header /><Alert /></StickyHeaderSurface>
              {children}
            </div>
          </main>
        </div>
      </UserProvider>
    </SocketProvider>
  );
}
