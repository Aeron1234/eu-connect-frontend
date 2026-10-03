"use client";
import {
  Activity,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Gauge,
  Layers,
  LayoutDashboard,
  LibraryBig,
  MapPin,
  Megaphone,
  SlidersHorizontal,
  UserPlus,
  Users,
  CircleUserRound,
  User,
} from "lucide-react";
import SignoutButton from "./SignoutButton";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useUser } from "@/contexts/UserContext";
import { useSidebar } from "@/contexts/SidebarContext";

function roleRoutes(userRole, userDepartment) {
  let routes = [];
  if (userRole === "student") {
    routes = [
      {
        name: "Narratives",
        href: "/student/narratives",
        icon: <BookOpen className="h-5 w-5 shrink-0" />,
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
    ];
  }

  if (userRole === "department_head") {
    if (userDepartment === "REG")
      routes.push({
        name: "SIPP Reports",
        href: "/department_head/sipp-reports",
        icon: <FileText className="h-5 w-5 shrink-0" />,
      });

    routes = [
      ...routes,
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
    ];

    if (userDepartment !== "REG")
      routes.push({
        name: "Records",
        href: "/internship-records",
        icon: <LibraryBig className="h-5 w-5 shrink-0" />,
      });
  }

  if (userRole === "admin") {
    routes = [
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
        name: "Cache Monitoring",
        href: "/admin/cache-monitoring",
        icon: <Gauge className="h-5 w-5 shrink-0" />,
      },
      {
        name: "Evaluation Criteria",
        href: "/admin/evaluation-criteria",
        icon: <SlidersHorizontal className="h-5 w-5 shrink-0" />,
      },
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
    ];
  }

  return routes;
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

function SideNavigationList({ firstName = "", fullName = "", avatar = null }) {
  const pathName = usePathname();
  const { user } = useUser();
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } =
    useSidebar();

  const userRole = user.role;
  const userDepartment = user.department_code;

  const roles = ["student", "employer", "department_head", "admin"];
  const role = roles.includes(userRole);

  if (!role) return null;

  const homeHref = `/${userRole}`;
  const accountHref = `/${userRole}/account`;
  const routes = roleRoutes(userRole, userDepartment) || [];

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
        className={`fixed lg:sticky inset-y-0 lg:inset-auto left-0 top-0 z-50 lg:h-screen h-full border-r border-primary-300 dark:border-white/25 bg-primary dark:bg-card text-sm text-white font-semibold py-4 px-4 flex flex-col transition-all duration-300 ease-in-out
  ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
  w-64 ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Collapse toggle - desktop only */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex items-center justify-center absolute -right-3 top-8 h-6 w-6 rounded-full bg-card text-primary-emphasis shadow-md hover:scale-110 transition-transform"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Logo section */}
        <Link
          href={homeHref}
          scroll={false}
          onClick={closeMobile}
          className="flex items-center gap-2 flex-col w-full mb-4 group cursor-pointer"
        >
          <div className="p-1 bg-white rounded-full group-hover:scale-105 transition-transform">
            <Logo compactOnDesktop={isCollapsed} />
          </div>

          <h2
            className={`text-base font-semibold line-clamp-2 text-center ${isCollapsed ? "lg:hidden" : ""}`}
          >
            EU-Connect
          </h2>
        </Link>

        <Link
          href={accountHref}
          scroll={false}
          onClick={closeMobile}
          title="View account"
          aria-label={`View account for ${fullName || "your profile"}`}
          aria-current={pathName === accountHref ? "page" : undefined}
          className={`group mb-4 flex w-full min-w-0 items-center gap-3 border border-white/15 bg-white/10 py-2.5 px-5 text-left transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            isCollapsed
              ? "lg:justify-center lg:p-0.5 rounded-full"
              : "rounded-xl"
          } ${pathName === accountHref ? "bg-white/20 border-white/30" : ""}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-card text-primary-emphasis ring-2 ring-white/20 transition-transform group-hover:scale-105">
            {avatar ? (
              <img
                src={`/avatars/${avatar}`}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="w-6 h-6" />
            )}
          </span>
          <span className={`min-w-0 flex-1 ${isCollapsed ? "lg:hidden" : ""}`}>
            <span className="block truncate text-sm font-semibold text-white">
              {fullName || "My account"}
            </span>
            <span className="block truncate text-xs font-normal text-white/80">
              {getFormattedRole(userRole) || "User"}
            </span>
          </span>
        </Link>

        <ul className="flex flex-col gap-1 flex-1 w-full overflow-y-auto">
          {userDepartment !== "REG" && (
            <NavLink
              href={homeHref}
              name="Dashboard"
              icon={<LayoutDashboard className="h-5 w-5 shrink-0" />}
              pathName={pathName}
              isCollapsed={isCollapsed}
              onClick={closeMobile}
              exact
            />
          )}

          {routes.map((item) => (
            <li key={item.name}>
              <NavLink
                href={item.href}
                name={item.name}
                icon={item.icon}
                pathName={pathName}
                isCollapsed={isCollapsed}
                onClick={closeMobile}
              />
            </li>
          ))}

          <div
            className={`flex flex-col gap-1 w-full ${routes.length > 0 ? "mt-2 pt-2 border-t border-primary-400 dark:border-border" : ""}`}
          >
            {publicRoutes.map((item) => (
              <li key={item.name}>
                <NavLink
                  href={item.href}
                  name={item.name}
                  icon={item.icon}
                  pathName={pathName}
                  isCollapsed={isCollapsed}
                  onClick={closeMobile}
                />
              </li>
            ))}
          </div>

          <div className="mt-auto pt-2 border-t border-primary-400 dark:border-border">
            <li title="Sign out">
              <SignoutButton isCollapsed={isCollapsed} />
            </li>
          </div>
        </ul>
      </aside>
    </>
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

  return (
    <Link
      scroll={false}
      href={href}
      title={name}
      onClick={onClick}
      className={`${isActive ? "bg-white text-primary" : ""} font-normal w-full flex items-center gap-2 px-5 py-2 hover:text-primary hover:bg-white transition-colors rounded-sm ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
    >
      {icon}
      <span className={isCollapsed ? "lg:hidden" : ""}>{name}</span>
    </Link>
  );
}

export default SideNavigationList;
