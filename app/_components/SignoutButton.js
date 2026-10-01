"use client";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/server-actions/auth";
import { useUser } from "@/contexts/UserContext";
import { useSidebar } from "@/contexts/SidebarContext";

function SignoutButton({ isCollapsed }) {
  const { resetUser } = useUser();
  const { resetSidebar } = useSidebar();

  function handleAction() {
    resetUser();
    resetSidebar();
    logout();
  }

  return (
    <form action={handleAction}>
      <button
        title="Sign out"
        className={`flex w-full items-center gap-2 px-5 py-2 hover:bg-card hover:text-primary-emphasis transition-colors rounded-sm font-normal ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
      >
        <LogOut className="h-5 w-5 shrink-0" />
        <span className={isCollapsed ? "lg:hidden" : ""}>Sign out</span>
      </button>
    </form>
  );
}

export default SignoutButton;
