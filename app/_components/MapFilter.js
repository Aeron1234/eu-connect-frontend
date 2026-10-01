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
          className={`h-full flex items-center px-2 py-1 rounded-full ${filteredBy.toLowerCase() === "all" ? "bg-primary text-white" : "bg-card "} border border-border `}
        >
          All
        </Link>
      </li>
      {uniqueStates.map((state, i) => (
        <li key={i} onClick={handleClick}>
          <Link
            href={`/department_head/map?filter=${state}`}
            className={`h-full flex items-center px-2 py-1 rounded-full ${filteredBy.toLowerCase() === state.toLowerCase() ? "bg-primary text-white" : "bg-card border border-border"} `}
          >
            {formatStateName(state)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default MapFilter;
