"use client";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/server-actions/auth";
import { useUser } from "@/contexts/UserContext";
import { useSidebar } from "@/contexts/SidebarContext";
import useSidebarTooltip from "./useSidebarTooltip";

function SignoutButton({ isCollapsed, compact = false }) {
  const { resetUser } = useUser();
  const { resetSidebar } = useSidebar();
  const { bind, tooltip } = useSidebarTooltip("Sign out", compact && isCollapsed);

  function handleAction() {
    resetUser();
    resetSidebar();
    logout();
  }

  return (
    <>
      <form action={handleAction}>
        <button
          type="submit"
          title={isCollapsed ? undefined : "Sign out"}
          aria-label="Sign out"
          {...bind}
          className={`${compact ? "h-9 w-9 justify-center" : `min-h-10 w-full gap-3 px-3 py-2.5 ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`} flex items-center rounded-lg font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!compact && <span className={isCollapsed ? "lg:hidden" : ""}>Sign out</span>}
        </button>
      </form>
      {tooltip}
    </>
  );
}

export default SignoutButton;
