"use client";

import { User } from "lucide-react";
import SignoutButton from "../SignoutButton";
import useSidebarTooltip from "../useSidebarTooltip";
import Link from "next/link";
import { getFormattedRole } from "./sidebarRoutes";

export default function SidebarAccount({
  accountHref,
  pathName,
  fullName,
  avatar,
  isCollapsed,
  closeMobile,
  userRole,
}) {
  const accountTooltip = useSidebarTooltip("Account", isCollapsed);

  return (
    <div className="mt-3 border-t border-white/25 pt-3">
      <div
        className={`flex items-center gap-1 ${isCollapsed ? "lg:flex-col" : ""}`}
      >
        <Link
          href={accountHref}
          scroll={false}
          onClick={closeMobile}
          title="View account"
          aria-label={`View account for ${fullName || "your profile"}`}
          aria-current={pathName === accountHref ? "page" : undefined}
          {...accountTooltip.bind}
          className={`group flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${isCollapsed ? "lg:justify-center" : ""} ${pathName === accountHref ? "bg-white/15" : ""}`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-white ring-1 ring-white/30 transition-transform group-hover:scale-105">
            {avatar ? (
              <img
                src={`/avatars/${avatar}`}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
          <span
            className={`min-w-0 flex-1 ${isCollapsed ? "lg:hidden" : ""}`}
          >
            <span className="block truncate text-xs font-semibold text-white">
              {fullName || "My account"}
            </span>
            <span className="block truncate text-[11px] font-normal text-white/65">
              {getFormattedRole(userRole)}
            </span>
          </span>
        </Link>
        {accountTooltip.tooltip}
        <SignoutButton isCollapsed={isCollapsed} compact />
      </div>
    </div>
  );
}
