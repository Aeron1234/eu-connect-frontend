"use client";
import { useLayoutEffect, useRef } from "react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Gauge,
  CircleHelp,
  Layers,
  LayoutDashboard,
  LibraryBig,
  MapPin,
  Megaphone,
  SlidersHorizontal,
  UserPlus,
  Users,
  User,
} from "lucide-react";
import SignoutButton from "./SignoutButton";
import SidebarThemeSwitch from "./SidebarThemeSwitch";
import useSidebarTooltip from "./useSidebarTooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useUser } from "@/contexts/UserContext";
import { useSidebar } from "@/contexts/SidebarContext";

function roleRouteGroups(userRole, userDepartment) {
  if (userRole === "student") {
    return [
      {
        label: "Student",
        routes: [
          {
            name: "Narratives",
            href: "/student/narratives",
            icon: <BookOpen className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Summary Reports",
            href: "/student/summary-reports",
            icon: <FileText className="h-5 w-5 shrink-0" />,
          },
          {
            name: "My Records",
            href: "/student/internship-record",
            icon: <LibraryBig className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Storage",
            href: "/student/storage",
            icon: <FolderOpen className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Evaluations",
            href: "/student/evaluations",
            icon: <ClipboardCheck className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Past Internships",
            href: "/past-internships",
            icon: <Building2 className="h-5 w-5 shrink-0" />,
          },
        ],
      },
    ];
  }

  if (userRole === "department_head") {
    const staffRoutes = [];
    if (userDepartment === "REG") {
      staffRoutes.push({
        name: "SIPP Reports",
        href: "/department_head/sipp-reports",
        icon: <FileText className="h-5 w-5 shrink-0" />,
      });
    }

    staffRoutes.push(
      {
        name: "Map",
        href: "/map",
        icon: <MapPin className="h-5 w-5 shrink-0" />,
      },
      {
        name: "Past Internships",
        href: "/past-internships",
        icon: <Building2 className="h-5 w-5 shrink-0" />,
      },
    );

    if (userDepartment !== "REG") {
      staffRoutes.push({
        name: "Records",
        href: "/internship-records",
        icon: <LibraryBig className="h-5 w-5 shrink-0" />,
      });
    }

    return [{ label: "Staff tools", routes: staffRoutes }];
  }

  if (userRole === "admin") {
    return [
      {
        label: "Administration",
        routes: [
          {
            name: "Accounts",
            href: "/admin/create-account",
            icon: <UserPlus className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Departments & Courses",
            href: "/admin/departments-and-courses",
            icon: <Layers className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Activity Logs",
            href: "/admin/activity-logs",
            icon: <Activity className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Error Tracking",
            href: "/admin/error-tracking",
            icon: <AlertTriangle className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Cache Monitoring",
            href: "/admin/cache-monitoring",
            icon: <Gauge className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Evaluation Criteria",
            href: "/admin/evaluation-criteria",
            icon: <SlidersHorizontal className="h-5 w-5 shrink-0" />,
          },
        ],
      },
      {
        label: "Staff tools",
        routes: [
          {
            name: "Map",
            href: "/map",
            icon: <MapPin className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Records",
            href: "/internship-records",
            icon: <LibraryBig className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Past Internships",
            href: "/past-internships",
            icon: <Building2 className="h-5 w-5 shrink-0" />,
          },
        ],
      },
    ];
  }

  return [];
}

const publicRoutes = [
  {
    name: "Announcements",
    href: "/announcements",
    icon: <Megaphone className="h-5 w-5 shrink-0" />,
  },
  {
    name: "Internships",
    href: "/internships",
    icon: <BriefcaseBusiness className="h-5 w-5 shrink-0" />,
  },
  {
    name: "Search Users",
    href: "/users",
    icon: <Users className="h-5 w-5 shrink-0" />,
  },
];

function getFormattedRole(role) {
  switch (role) {
    case "student":
      return "Student";
    case "employer":
      return "Employer";
    case "department_head":
      return "Department Head";
    case "admin":
      return "Administrator";
    default:
      return "User";
  }
}

function SideNavigationList({ fullName = "", avatar = null }) {
  const pathName = usePathname();
  const { user } = useUser();
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile, navigationScrollRef } =
    useSidebar();
  const accountTooltip = useSidebarTooltip("Account", isCollapsed);
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
  const routeGroups = [
    ...(userDepartment !== "REG"
      ? [
          {
            label: "Overview",
            routes: [
              {
                name: "Dashboard",
                href: homeHref,
                icon: <LayoutDashboard size={20} />,
                exact: true,
              },
            ],
          },
        ]
      : []),
    ...roleRouteGroups(userRole, userDepartment),
    {
      label: "Planning",
      routes: [
        {
          name: "Calendar",
          href: "/calendar",
          icon: <CalendarDays className="h-5 w-5 shrink-0" />,
        },
      ],
    },
    { label: "Public", routes: publicRoutes },
  ];

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
        <Link
          href={homeHref}
          scroll={false}
          onClick={closeMobile}
          className={`group flex h-16 w-full shrink-0 items-center gap-3 border-b border-white/25 ${isCollapsed ? "lg:justify-center" : ""}`}
        >
          <div className="shrink-0 rounded-full bg-white p-0.5 transition-transform group-hover:scale-105">
            <Logo small />
          </div>
          <h2
            className={`text-sm font-bold tracking-wide ${isCollapsed ? "lg:hidden" : ""}`}
          >
            EU-Connect
          </h2>
        </Link>

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
        <div className="mt-4">
          <SidebarThemeSwitch isCollapsed={isCollapsed} />
        </div>
      </aside>
    </>
  );
}

function NavSection({
  label,
  routes,
  divided,
  isCollapsed,
  pathName,
  onClick,
}) {
  return (
    <section
      aria-label={label}
      className={`w-full ${divided ? "mt-2 border-t border-white/20 pt-2" : ""}`}
    >
      <h3
        className={`px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 ${isCollapsed ? "lg:hidden" : ""}`}
      >
        {label}
      </h3>
      <ul className="flex flex-col gap-1">
        {routes.map((item) => (
          <li key={item.href}>
            <NavLink
              scroll={false}
              href={item.href}
              name={item.name}
              icon={item.icon}
              pathName={pathName}
              isCollapsed={isCollapsed}
              onClick={onClick}
              exact={item.exact}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function NavLink({
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

export default SideNavigationList;
