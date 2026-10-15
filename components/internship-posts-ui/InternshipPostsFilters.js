import SearchBar from "../ui/SearchBar";
import DropdownFilter from "../ui/DropdownFilter";
import { scopeTabs, favoriteOptions } from "./internshipPostOptions";

export default function InternshipPostsFilters({
  userRole,
  scope,
  setScope,
  query,
  setQuery,
  workType,
  setWorkType,
  workTypeOptions,
  courses,
  courseId,
  setCourseId,
  courseOptions,
  favorite,
  setFavorite,
}) {
  return (
    <>
      {userRole === "employer" && (
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex rounded-lg bg-secondary p-1 w-fit">
            {scopeTabs.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setScope(s.value)}
                className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  scope === s.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-primary-emphasis"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="items-start">
          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or position..."
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <DropdownFilter
            value={workType}
            onValueChange={setWorkType}
            options={workTypeOptions}
            placeholder="Work Type"
            className="bg-card p-2 flex-1 sm:flex-0 rounded-md"
          />
          {courses.length > 0 && (
            <DropdownFilter
              value={courseId}
              onValueChange={setCourseId}
              options={courseOptions}
              placeholder="Course"
              className="bg-card p-2 flex-1 sm:flex-0 rounded-md"
            />
          )}
          {userRole === "student" && (
            <DropdownFilter
              value={favorite}
              onValueChange={setFavorite}
              options={favoriteOptions}
              placeholder="All Posts"
              className="bg-card p-2 flex-1 sm:flex-0 rounded-md"
            />
          )}
        </div>
      </div>
    </>
  );
}
