"use client";

import SearchBar from "@/components/ui/SearchBar";
import DropdownFilter from "@/components/ui/DropdownFilter";

export default function DepartmentCourseFilters({
  view, setView, status, setStatus,
  query, setQuery, departments, courses,
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="w-full sm:w-64 sm:shrink-0">
        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or code..."
          ariaLabel="Search departments or courses"
          position="right"
        />
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <DropdownFilter
          value={view}
          onValueChange={setView}
          options={[
            { value: "departments", label: `Departments (${departments.length})` },
            { value: "courses", label: `Courses (${courses.length})` },
          ]}
          placeholder="View"
          className="h-10 min-w-0 flex-1 rounded-md bg-card px-3 text-xs sm:w-44 sm:flex-none"
        />
        <DropdownFilter
          value={status}
          onValueChange={setStatus}
          options={[
            { value: "all", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          placeholder="Status"
          className="h-10 min-w-0 flex-1 rounded-md bg-card px-3 text-xs sm:w-36 sm:flex-none"
        />
      </div>
    </div>
  );
}
