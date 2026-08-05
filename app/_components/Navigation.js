"use client";

import { CircleUserRound, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import NotificationsButton from "./NotificationsButton";

function Navigation({ inboxData }) {
  const pathName = usePathname();
  const icon = "";

  return (
    <div className="flex-1 h-full flex items-center justify-end gap-4 text-sm text-stone-600 relative py-1">
      <div className="block min-[670px]:hidden">
        <Menu className="w-6 h-6 cursor-pointer hover:text-primary-500" />
      </div>

      <div className="hidden min-[670px]:flex items-center gap-4">
        <NotificationsButton inboxData={inboxData || {}} />

        <Link
          href="/account"
          className={`${pathName === "/account" ? "text-primary-500" : ""} relative hover:text-primary-500 transition-all h-full`}
          title="Account"
        >
          {icon ? icon : <CircleUserRound className="h-6 w-6" />}
        </Link>
      </div>
    </div>
  );
}

export default Navigation;
