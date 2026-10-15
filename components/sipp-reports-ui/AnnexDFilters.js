"use client";

import SearchBar from "../ui/SearchBar";
import DropdownFilter from "../ui/DropdownFilter";

export default function AnnexDFilters({ query, setQuery, year, setYear, showCachedFilters, availableAcadYear = [] }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="w-full sm:w-64 sm:shrink-0">
        <SearchBar
          value={query}
          onChange={(e) => {
            const search = e.target.value;
            setQuery(search);
            showCachedFilters({ academicYear: year, search: search.trim() });
          }}
          placeholder="Search company or student name..."
          position="right"
          ariaLabel="Search Annex D companies or students"
        />
      </div>

      <DropdownFilter
        value={year}
        onValueChange={(academicYear) => {
          setYear(academicYear);
          showCachedFilters({ academicYear, search: query.trim() });
        }}
        options={[
          { value: "", label: "All academic years" },
          ...availableAcadYear.map((academicYear) => ({ value: academicYear, label: academicYear })),
        ]}
        placeholder="Academic year"
        className="h-10 w-full min-w-0 rounded-md bg-card px-3 text-xs sm:w-44"
      />
    </div>
  );
}
