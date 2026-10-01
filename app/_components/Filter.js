"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

function Filter() {
  const pathName = usePathname();

  function filter() {
    if (pathName === "/student/storage")
      return [
        { href: "/student/storage", value: "all", text: "All" },
        {
          href: "/student/storage?filter=before",
          value: "before",
          text: "Before",
        },
        {
          href: "/student/storage?filter=after",
          value: "after",
          text: "After",
        },
      ];
    if (pathName === "/account")
      return [
        {
          href: "/account?filter=records",
          value: "records",
          text: "Records",
        },
        {
          href: "/account?filter=evaluations",
          value: "evaluations",
          text: "Evaluations",
        },
      ];

    if (pathName === "/admin/map")
      return [
        {
          href: "/admin/map",
          value: "records",
          text: "Records",
        },
        {
          href: "/account?filter=evaluations",
          value: "evaluations",
          text: "Evaluations",
        },
      ];
  }

  const filterItems = filter();

  return (
    <ul className="flex items-center py-2 px-1 gap-0.5 rounded-2xl bg-primary w-fit text-primary-50 font-bold text-xs">
      {filterItems.map((item) => (
        <li key={item.value}>
          <Button href={item.href} filter={item.value} pathName={pathName}>
            {item.text}
          </Button>
        </li>
      ))}
    </ul>
  );
}

function Button({ href, children, filter, pathName }) {
  const searchParams = useSearchParams();

  function active() {
    if (pathName === "/student/storage")
      return searchParams.get("filter") ?? "all";

    if (pathName === "/account") {
      return searchParams.get("filter") ?? "records";
    }
  }

  return (
    <Link
      href={href}
      className={`${active() === filter ? "bg-primary-50 text-primary-emphasis" : ""} flex-1 rounded-xl px-4 py-1 hover:bg-primary-50 hover:text-primary-emphasis transition-colors`}
    >
      {children}
    </Link>
  );
}

export default Filter;
