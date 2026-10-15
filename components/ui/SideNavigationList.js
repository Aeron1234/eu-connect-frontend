"use client";

import { useLayoutEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, CircleHelp } from "lucide-react";
import SidebarThemeSwitch from "./SidebarThemeSwitch";
import { usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { getSidebarRouteGroups } from "./sidebar/sidebarRoutes";
import NavLink from "./sidebar/SidebarNavLink";
import NavSection from "./sidebar/SidebarNavSection";
import SidebarBrand from "./sidebar/SidebarBrand";
import SidebarAccount from "./sidebar/SidebarAccount";

export default function SideNavigationList({ fullName = "", avatar = null }) {
  const pathName = usePathname();
  const { user } = useUser();
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile, navigationScrollRef } =
    useSidebar();

  const navRef = useRef(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const previousBehavior = nav.style.scrollBehavior;
    nav.style.scrollBehavior = "auto";
    nav.scrollTop = navigationScrollRef.current;
    nav.style.scrollBehavior = previousBehavior;
  }, [navigationScrollRef]);

  const userRole = user.role;
  const userDepartment = user.department_code;

  const roles = ["student", "employer", "department_head", "admin"];
  const role = roles.includes(userRole);

  if (!role) return null;

  const homeHref = `/${userRole}`;
  const accountHref = `/${userRole}/account`;
  const routeGroups = getSidebarRouteGroups(userRole, userDepartment, homeHref);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 top-0 z-50 flex h-full flex-col border-r border-primary-300 bg-primary px-3 pb-5 text-sm font-semibold text-white transition-all duration-300 ease-in-out dark:border-white/15 dark:bg-card lg:sticky lg:inset-auto lg:h-screen
  ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
  w-64 ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Collapse toggle - desktop only */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-12 hidden h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-primary-emphasis shadow-md transition-transform hover:scale-110 lg:flex"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Brand */}
        <SidebarBrand homeHref={homeHref} closeMobile={closeMobile} isCollapsed={isCollapsed} />

        <nav
          ref={navRef}
          onScroll={(event) => {
            navigationScrollRef.current = event.currentTarget.scrollTop;
          }}
          className="mt-3 flex min-h-0 w-full flex-1 flex-col overflow-y-auto"
          aria-label="Main navigation"
        >
          {routeGroups.map((group, index) => (
            <NavSection
              key={group.label}
              label={group.label}
              routes={group.routes}
              divided={index > 0}
              isCollapsed={isCollapsed}
              pathName={pathName}
              onClick={closeMobile}
            />
          ))}
        </nav>
        <div className="mt-2">
          <NavLink
            href="/help"
            name="Help"
            icon={<CircleHelp className="h-5 w-5 shrink-0" />}
            pathName={pathName}
            isCollapsed={isCollapsed}
            onClick={closeMobile}
            exact
          />
        </div>
        <SidebarAccount
          accountHref={accountHref}
          pathName={pathName}
          fullName={fullName}
          avatar={avatar}
          isCollapsed={isCollapsed}
          closeMobile={closeMobile}
          userRole={userRole}
        />
        <div className="mt-4">
          <SidebarThemeSwitch isCollapsed={isCollapsed} />
        </div>
      </aside>
    </>
  );
}
