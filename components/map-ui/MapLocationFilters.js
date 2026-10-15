"use client";

import SearchBar from "../ui/SearchBar";
import MapDropdownFilter from "./MapDropdownFilter";

export default function MapLocationFilters({ query, setQuery, regions, regionId, setRegionId }) {
  return (
    <div className="flex gap-2 flex-col sm:flex-row">
      <div className="relative">
        {/* <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> */}
        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search student, company, course..."
          aria-label="Search student, company, course"
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent sm:max-w-md"
        />
      </div>

      <MapDropdownFilter
        regions={regions}
        regionId={regionId}
        onChange={setRegionId}
      />
    </div>
  );
}
