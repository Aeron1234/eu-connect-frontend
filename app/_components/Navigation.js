"use client";

import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItem = [
  {
    name: "Announcements",
    href: "/announcements",
  },
  {
    name: "Internships",
    href: "/internships",
  },
];

function Navigation() {
  const pathName = usePathname();

  const icon = "";

  return (
    <ul className="flex items-center text-sm font-semibold">
      {navigationItem.map((item) => (
        <li key={item.name}>
          <Button href={item.href} name={item.name} pathName={pathName} />
        </li>
      ))}

      <li>
        <Link
          href="/account"
          className={`${pathName === "/account" ? "text-primary-500 shadow-[0_4px_0_0] shadow-primary-500" : ""} py-2 px-4 hover:text-primary-500 transition-all flex items-center gap-2`}
        >
          {icon ? icon : <CircleUserRound />}
          <span>Account</span>
        </Link>
      </li>
    </ul>
  );
}

function Button({ href, name, pathName }) {
  return (
    <Link
      href={href}
      className={`${pathName === href ? "text-primary-500 shadow-[0_4px_0_0] shadow-primary-500" : ""} py-2 px-5 hover:text-primary-500 transition-all `}
    >
      {name}
    </Link>
  );
}

export default Navigation;
