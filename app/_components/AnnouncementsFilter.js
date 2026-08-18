"use client";

import Link from "next/link";

function AnnouncementsFilter({ categories, filteredByCategory, search }) {
  if (categories.length === 0) return null;

  const isSearchEmpty = search.trim() === "" ? `` : `&search=${search}`;

  return (
    <ul className="flex items-center gap-1 font-medium">
      <li>
        <Link
          href={`/announcements?category=all${isSearchEmpty}`}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filteredByCategory === "all" ? "text-white bg-primary-500" : "hover:bg-stone-200"}`}
        >
          All
        </Link>
      </li>
      {categories.map((category) => (
        <li key={category.id}>
          <FilterButton
            href={category.name.toLowerCase()}
            label={category.name}
            filteredByCategory={filteredByCategory}
            search={isSearchEmpty}
          />
        </li>
      ))}
    </ul>
  );
}

function FilterButton({ href, label, filteredByCategory, search }) {
  return (
    <Link
      href={`/announcements?category=${href}${search}`}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filteredByCategory === href ? "text-white bg-primary-500" : "hover:bg-red-100"}`}
    >
      {label}
    </Link>
  );
}

export default AnnouncementsFilter;
