"use client";
import {
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LibraryBig,
  MapPin,
  Megaphone,
  SlidersHorizontal,
  UserPlus,
  Users,
} from "lucide-react";
import SignoutButton from "./SignoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWindowSize } from "../_services/helpers";
import Logo from "./Logo";
import { useUser } from "@/contexts/UserContext";

function roleRoutes(userRole, userDepartment) {
  let routes;
  if (userRole === "student") {
    routes = [
      {
        name: "Narratives",
        href: "/student/narratives",
        icon: <BookOpen className="h-5 w-5" />,
      },
      {
        name: "My Records",
        href: "/student/internship-record",
        icon: <LibraryBig className="h-5 w-5" />,
      },
      {
        name: "Storage",
        href: "/student/storage",
        icon: <FolderOpen className="h-5 w-5" />,
      },
      {
        name: "Evaluations",
        href: "/student/evaluations",
        icon: <ClipboardCheck className="h-5 w-5" />,
      },
      {
        name: "Past Internships",
        href: "/past-internships",
        icon: <Building2 className="h-5 w-5" />,
      },
    ];
  }

  if (userRole === "department_head") {
    routes = [
      {
        name: "Map",
        href: "/map",
        icon: <MapPin className="h-5 w-5" />,
      },
      {
        name: "Past Internships",
        href: "/past-internships",
        icon: <Building2 className="h-5 w-5" />,
      },
    ];

    if (userRole === "department_head" && userDepartment === "REG")
      routes.push({
        name: "SIPP Reports",
        href: "/department_head/sipp-reports",
        icon: <FileText className="h-5 w-5" />,
      });

    if (userRole === "department_head" && userDepartment !== "REG")
      routes.push({
        name: "Records",
        href: "/internship-records",
        icon: <LibraryBig className="h-5 w-5" />,
      });
  }

  if (userRole === "admin") {
    routes = [
      {
        name: "Map",
        href: "/map",
        icon: <MapPin className="h-5 w-5" />,
      },
      {
        name: "Accounts",
        href: "/admin/create-account",
        icon: <UserPlus className="h-5 w-5" />,
      },
      {
        name: "Records",
        href: "/internship-records",
        icon: <LibraryBig className="h-5 w-5" />,
      },
      {
        name: "Evaluation Criteria",
        href: "/admin/evaluation-criteria",
        icon: <SlidersHorizontal className="h-5 w-5" />,
      },

      {
        name: "Past Internships",
        href: "/past-internships",
        icon: <Building2 className="h-5 w-5" />,
      },
    ];
  }

  return routes;
}

const publicRoutes = [
  {
    name: "Announcements",
    href: "/announcements",
    icon: <Megaphone className="h-5 w-5" />,
  },
  {
    name: "Internships",
    href: "/internships",
    icon: <BriefcaseBusiness className="h-5 w-5" />,
  },
  {
    name: "Search Users",
    href: "/users",
    icon: <Users className="h-5 w-5" />,
  },
];

function SideNavigationList({ firstName = "" }) {
  const pathName = usePathname();
  const { user } = useUser();
  const { width } = useWindowSize();

  const userRole = user.role;
  const userDepartment = user.department_code;

  const roles = ["student", "employer", "department_head", "admin"];
  const role = roles.includes(userRole);

  if (!role) return null;

  const homeHref = `/${userRole}`;

  const routes = roleRoutes(userRole, userDepartment) || [];

  return (
    // 🌟 1. Added 'flex flex-col' so the container handles structural height calculations properly
    <aside
      className={`w-full h-full min-w-55 bg-primary-500 text-sm text-white font-semibold py-4 px-4 flex flex-col`}
    >
      {/* Logo section */}
      <Link
        href={homeHref}
        scroll={false}
        className="flex items-center gap-2 flex-col w-full mb-4 group cursor-pointer"
      >
        <div className="p-1 bg-white rounded-full group-hover:scale-105 transition-transform">
          <Logo />
        </div>

        <h2 className="text-base font-semibold line-clamp-2 max-sm:text-base">
          EU-Connect
        </h2>
      </Link>

      {firstName && (
        <div className="bg-white/10 px-5 py-1 mb-4 w-full flex flex-col rounded-lg border border-white/10">
          <span className="text-white/80 font-normal">Welcome back,</span>{" "}
          <span className="text-lg">{firstName}</span>
        </div>
      )}

      {/* 🌟 2. Added 'flex-1' to force the list to scale down and take up all available screen vertical space */}
      <ul className="flex flex-col gap-1 flex-1 w-full">
        <Link
          scroll={false}
          href={`/${userRole}`}
          className={`${pathName === `/${userRole}` ? "bg-white text-primary-500" : ""} font-normal w-full flex items-center gap-2 px-5 py-2 max-lg:px-2 hover:text-primary-500 hover:bg-white transition-colors rounded-sm`}
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>
        {routes &&
          routes.map((item) => (
            <li key={item.name}>
              <Button
                item={item}
                pathName={pathName}
                role={role}
                screenSize={width}
              />
            </li>
          ))}

        <div
          className={`flex flex-col gap-1 w-full ${routes.length > 0 ? "lg:mt-2 lg:pt-2 lg:border-t lg:border-primary-400" : ""}`}
        >
          {publicRoutes.map((item) => (
            <li key={item.name}>
              <Button
                item={item}
                pathName={pathName}
                role={role}
                screenSize={width}
              />
            </li>
          ))}
        </div>

        {/* 🌟 3. Applied 'mt-auto' securely here. The flex wrapper above will now anchor this exactly to the floor! */}
        <div className="mt-auto pt-2 border-t border-primary-400">
          <li className="" title="Sign out">
            <SignoutButton role={role} screenSize={width} />
          </li>
        </div>
      </ul>
    </aside>
  );
}

function Button({ item, pathName }) {
  return (
    <Link
      scroll={false}
      href={item.href}
      title={item.name}
      className={`${pathName.includes(item.href) ? "bg-white text-primary-500" : ""} font-normal w-full flex items-center gap-2 px-5 py-2 max-lg:px-2 hover:text-primary-500 hover:bg-white transition-colors rounded-sm`}
    >
      {item.icon}
      {item.name}
    </Link>
  );
}

export default SideNavigationList;
