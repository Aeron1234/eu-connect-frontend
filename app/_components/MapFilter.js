"use client";

import Link from "next/link";

function MapFilter({
  activeInternships,
  filteredBy,
  query,
  setQuery,
  search,
  setSearch,
}) {
  if (!activeInternships || activeInternships.length === 0) return null;

  function formatStateName(state) {
    return state
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function handleClick() {
    setQuery("");
    setSearch("");
  }

  const uniqueStates = [
    ...new Set(
      activeInternships.map((internship) =>
        internship.state_or_province.toLowerCase(),
      ),
    ),
  ];

  return (
    <ul className="flex gap-1 font-medium text-sm">
      <li onClick={handleClick}>
        <Link
          href={`/department_head/map?filter=all`}
          className={`h-full flex items-center px-2 py-1 rounded-full ${filteredBy.toLowerCase() === "all" ? "bg-primary-500 text-white" : "bg-white "} border border-stone-300 `}
        >
          All
        </Link>
      </li>
      {uniqueStates.map((state, i) => (
        <li key={i} onClick={handleClick}>
          <Link
            href={`/department_head/map?filter=${state}`}
            className={`h-full flex items-center px-2 py-1 rounded-full ${filteredBy.toLowerCase() === state.toLowerCase() ? "bg-primary-500 text-white" : "bg-white border border-stone-300"} `}
          >
            {formatStateName(state)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default MapFilter;
