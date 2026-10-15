"use client";

import useSidebarTooltip from "../useSidebarTooltip";
import Link from "next/link";

export default function SidebarNavLink({
  href,
  name,
  icon,
  pathName,
  isCollapsed,
  onClick,
  exact = false,
}) {
  const isActive = exact ? pathName === href : pathName.includes(href);
  const { bind, tooltip } = useSidebarTooltip(name, isCollapsed);

  return (
    <>
      <Link
        scroll={false}
        href={href}
        title={isCollapsed ? undefined : name}
        aria-label={name}
        onClick={onClick}
        {...bind}
        aria-current={isActive ? "page" : undefined}
        className={`relative flex min-h-10 w-full items-center gap-3 px-3 py-2.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${isActive ? "rounded-l-md rounded-r-full bg-white/20 text-white shadow-sm dark:bg-white/10" : "rounded-lg text-white/85 hover:bg-white/10 hover:text-white"} ${isCollapsed ? "lg:justify-center lg:px-0 lg:rounded-xl" : ""}`}
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-primary-300"
          />
        )}
        {icon}
        <span className={isCollapsed ? "lg:hidden" : ""}>{name}</span>
      </Link>
      {tooltip}
    </>
  );
}
