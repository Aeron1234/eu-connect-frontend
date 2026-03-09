"use client";

import Link from "next/link";
import SignoutButton from "./SignoutButton";
import { usePathname } from "next/navigation";

function SideNavigation({ navigation }) {
  const pathName = usePathname();

  const roles = ["student", "employer", "admin", "superAdmin"];

  const role = roles.includes(pathName.split("/").at(1)) ?? null;

  return (
    <nav className="bg-white rounded-md shadow-sm text-sm text-stone-800 font-semibold hidden lg:block py-4 px-1">
      <ul className="flex flex-col gap-1 h-full">
        {navigation.map((item) => (
          <li key={item.name}>
            <Button item={item} pathName={pathName} role={role} />
          </li>
        ))}

        <li className="mt-auto">
          <SignoutButton role={role} />
        </li>
      </ul>
    </nav>
  );
}

function Button({ item, role, pathName }) {
  return (
    <Link
      href={item.href}
      className={`${pathName === item.href ? "shadow-[-4px_0_0_0] shadow-primary-500 bg-stone-100 text-primary-500" : ""} flex items-center gap-2 px-5 py-2 hover:text-primary-500 hover:bg-stone-100 transition-colors `}
    >
      {item.icon}
      {role && item.name}
    </Link>
  );
}

export default SideNavigation;
