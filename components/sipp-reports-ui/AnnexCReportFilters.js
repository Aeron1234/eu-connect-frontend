"use client";

import SearchBar from "../ui/SearchBar";
import DropdownFilter from "../ui/DropdownFilter";

export default function AnnexCReportFilters({
  query, setQuery, editingReportId, resetForm, showCachedFilters,
  reportsYear, setReportsYear, reportsStatus, setReportsStatus, availableYears = [],
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="w-full sm:w-64 sm:shrink-0">
        <SearchBar
          value={query}
          onChange={(e) => {
            if (editingReportId) resetForm();
            const search = e.target.value;
            setQuery(search);
            showCachedFilters({ academicYear: reportsYear, status: reportsStatus, search: search.trim() });
          }}
          placeholder="Search degree or program..."
          position="right"
          ariaLabel="Search Annex C reports"
        />
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <DropdownFilter
          value={reportsYear}
          onValueChange={(academicYear) => {
            if (editingReportId) resetForm();
            setReportsYear(academicYear);
            showCachedFilters({ academicYear, status: reportsStatus, search: query.trim() });
          }}
          options={[
            { value: "", label: "All academic years" },
            ...availableYears.map((year) => ({ value: year, label: year })),
          ]}
          placeholder="Academic year"
          className="h-10 min-w-0 flex-1 rounded-md bg-card px-3 text-xs sm:w-44 sm:flex-none"
        />
        <DropdownFilter
          value={reportsStatus}
          onValueChange={(status) => {
            if (editingReportId) resetForm();
            setReportsStatus(status);
            showCachedFilters({ academicYear: reportsYear, status, search: query.trim() });
          }}
          options={[
            { value: "", label: "All statuses" },
            { value: "draft", label: "Drafts" },
            { value: "submitted", label: "Submitted" },
          ]}
          placeholder="Report status"
          className="h-10 min-w-0 flex-1 rounded-md bg-card px-3 text-xs sm:w-36 sm:flex-none"
        />
      </div>
    </div>
  );
}
