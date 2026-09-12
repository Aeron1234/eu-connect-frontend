"use client";
import { CircleUserRound, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import NotificationsButton from "./NotificationsButton";
import { useUser } from "@/contexts/UserContext";
import { useSidebar } from "@/contexts/SidebarContext";

function Navigation({ inboxData }) {
  const pathName = usePathname();
  const { user } = useUser();
  const { toggleMobile } = useSidebar();

  return (
    <div className="flex-1 h-full flex items-center justify-end gap-4 text-sm text-stone-600 relative py-1">
      <button
        onClick={toggleMobile}
        className="mr-auto lg:hidden"
        aria-label="Toggle navigation menu"
      >
        <Menu className="w-6 h-6 cursor-pointer hover:text-primary-500" />
      </button>

      <div className="flex items-center gap-4">
        <NotificationsButton inboxData={inboxData || {}} />

        <Link
          href={`/${user.role}/account`}
          className={`${pathName === `/${user.role}/account` ? "text-primary-500" : ""} hidden lg:flex relative hover:text-primary-500 transition-all h-full items-center`}
          title="Account"
        >
          <CircleUserRound className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}

export default Navigation;
