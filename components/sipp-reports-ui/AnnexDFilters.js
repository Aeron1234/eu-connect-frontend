"use client";

import SearchBar from "../ui/SearchBar";
import { cx } from "@/lib/utils";

export default function AnnexDFilters({ query, setQuery, year, setYear, showCachedFilters, availableAcadYear }) {
  return (
    <div className="flex gap-2 flex-col sm:flex-row">
      <div className="items-start">
        <SearchBar
          value={query}
          onChange={(e) => {
            const search = e.target.value;
            setQuery(search);
            showCachedFilters({ academicYear: year, search: search.trim() });
          }}
          placeholder="Search company or student name..."
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {["All", ...availableAcadYear].map((ay) => (
          <button
            key={ay}
            type="button"
            onClick={() => {
              const academicYear = ay === "All" ? "" : ay;
              setYear(academicYear);
              showCachedFilters({ academicYear, search: query.trim() });
            }}
            className={cx(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              (ay === "All" && !year) || year === ay
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-primary-emphasis",
            )}
          >
            {ay}
          </button>
        ))}
      </div>
    </div>
  );
}
