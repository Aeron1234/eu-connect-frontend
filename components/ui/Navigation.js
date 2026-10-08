"use client";
import { Menu } from "lucide-react";

import NotificationsButton from "./NotificationsButton";
import HeaderCalendarButton from "./HeaderCalendarButton";
import { useSidebar } from "@/contexts/SidebarContext";

function Navigation() {
  const { toggleMobile } = useSidebar();

  return (
    <div className="relative flex h-full flex-1 items-center justify-end py-1 text-sm text-foreground-soft">
      <button
        type="button"
        onClick={toggleMobile}
        className="mr-auto inline-flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
        aria-label="Toggle navigation menu"
      >
        <Menu className="size-5" />
      </button>

      <HeaderCalendarButton />
      <NotificationsButton />
    </div>
  );
}

export default Navigation;
