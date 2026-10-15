"use client";

import SearchBar from "@/components/ui/SearchBar";
import { cx } from "@/lib/utils";

export default function DepartmentCourseFilters({
  view, setView, status, setStatus,
  query, setQuery, departments, courses,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-row sm:flex-col gap-3 justify-between ">
        <div className="flex flex-wrap-reverse items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setView("departments")}
              className={cx(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                view === "departments"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              Departments ({departments.length})
            </button>
            <button
              type="button"
              onClick={() => setView("courses")}
              className={cx(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                view === "courses"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              Courses ({courses.length})
            </button>
          </div>

          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search departments or courses by name or code..."
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", "active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cx(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                status === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
