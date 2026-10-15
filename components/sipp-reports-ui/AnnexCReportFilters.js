"use client";

import SearchBar from "../ui/SearchBar";

export default function AnnexCReportFilters({
  query, setQuery, editingReportId, resetForm, showCachedFilters,
  reportsYear, setReportsYear, reportsStatus, setReportsStatus, availableYears,
}) {
  return (
<>
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="items-start">
          <SearchBar
            value={query}
            onChange={(e) => {
              if (editingReportId) resetForm();
              const search = e.target.value;
              setQuery(search);
              showCachedFilters({ academicYear: reportsYear, status: reportsStatus, search: search.trim() });
            }}
            placeholder="Search degree or program..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["All", ...availableYears].map((ay) => (
            <button
              key={ay}
              onClick={() => {
                if (editingReportId) resetForm();
                const academicYear = ay === "All" ? "" : ay;
                setReportsYear(academicYear);
                showCachedFilters({ academicYear, status: reportsStatus, search: query.trim() });
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                (ay === "All" && !reportsYear) || reportsYear === ay
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-primary-emphasis"
              }`}
            >
              {ay}
            </button>
          ))}
        </div>
      </div>

                <div className="flex flex-wrap items-center gap-2" aria-label="Report status">
        {[
          { value: "", label: "All statuses" },
          { value: "draft", label: "Drafts" },
          { value: "submitted", label: "Submitted" },
        ].map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              if (editingReportId) resetForm();
              setReportsStatus(value);
              showCachedFilters({ academicYear: reportsYear, status: value, search: query.trim() });
            }}
            aria-pressed={reportsStatus === value}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${reportsStatus === value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-primary-emphasis"}`}
          >
            {label}
          </button>
        ))}
      </div>
</>
  );
}
