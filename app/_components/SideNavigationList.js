"use client";
import { FolderOpen, LayoutDashboard, MapPin, UserPlus } from "lucide-react";
import SignoutButton from "./SignoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UseTooltip from "./UseTooltip";
import { useWindowSize } from "../_services/helpers";

function SideNavigationList({ userRole }) {
  const pathName = usePathname();
  const { width } = useWindowSize();

  const roles = ["student", "employer", "department_head", "admin"];
  const role = roles.includes(userRole);

  if (!role) return null;

  function navigation(userRole) {
    if (userRole === "student") {
      return [
        {
          name: "Dashboard",
          href: "/student",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          name: "Storage",
          href: "/student/storage",
          icon: <FolderOpen className="h-5 w-5" />,
        },
      ];
    }

    if (userRole === "department_head") {
      return [
        {
          name: "Dashboard",
          href: "/department_head",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          name: "Map",
          href: "/department_head/map",
          icon: <MapPin className="h-5 w-5" />,
        },
      ];
    }

    if (userRole === "admin") {
      return [
        {
          name: "Dashboard",
          href: "/admin",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          name: "Accounts",
          href: "/admin/accounts",
          icon: <UserPlus className="h-5 w-5" />,
        },
      ];
    }
  }

  const routes = navigation(userRole);

  return (
    <aside
      className={`w-full min-w-50 bg-primary-500  text-sm text-white font-semibold py-4 max-xl:min-w-fit max-lg:py-2 max-lg:row-start-3 `}
    >
      <ul className="flex flex-col max-lg:flex-row gap-1 h-full px-1 justify-between w-full">
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

        <li className="mt-auto max-lg:ml-auto">
          <SignoutButton role={role} screenSize={width} />
        </li>
      </ul>
    </aside>
  );
}

function Button({ item, pathName, screenSize }) {
  if (screenSize > 1100)
    return (
      <Link
        href={item.href}
        className={`${pathName === item.href ? "bg-primary-600" : ""} w-full flex items-center gap-2 px-5 py-2 max-lg:px-2 hover:text-white hover:bg-primary-600 transition-colors rounded-sm`}
      >
        {item.icon}
        {item.name}
      </Link>
    );

  return (
    <UseTooltip
      side={screenSize < 1100 && screenSize >= 1024 ? "right" : "top"}
      label={item.name}
      className={"w-full bg-transparent "}
    >
      <Link
        href={item.href}
        className={`${pathName === item.href ? "bg-primary-600" : ""} w-full flex items-center gap-2 px-5 py-2 max-lg:px-2 hover:text-white hover:bg-primary-600 transition-colors rounded-sm`}
      >
        {item.icon}
      </Link>
    </UseTooltip>
  );
}

export default SideNavigationList;
