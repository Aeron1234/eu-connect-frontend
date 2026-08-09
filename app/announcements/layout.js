import { notFound, redirect } from "next/navigation";
import Header from "../_components/Header";
import SideNavigation from "../_components/SideNavigation";
import { getUserSession } from "../_services/services";
import Alert from "../_components/Alert";
import SocketProvider from "../_components/SocketProvider";

async function AccountLayout({ children }) {
  const session = await getUserSession();
  if (!session?.user) return redirect("/login");

  return (
    <SocketProvider userId={session.user.id}>
      <div className="relative grid grid-cols-[auto_1fr] max-lg:grid-cols-1 h-screen overflow-hidden antialiased text-stone-800">
        <SideNavigation />

        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-stone-100">
          <div className="px-6 py-1 flex items-center w-full bg-white/50 backdrop-blur-sm text-stone-800 h-16 border-b border-stone-300">
            <Header />
            <Alert />
          </div>

          <div className="py-4 px-8 max-lg:px-4 flex-1 overflow-y-auto ">
            {children}
          </div>
        </main>
      </div>
    </SocketProvider>
  );
}

export default AccountLayout;
