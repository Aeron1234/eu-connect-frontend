import { ChevronDown, Plus } from "lucide-react";

function InternshipRecordFormHeader({ showForm, setShowForm }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 pr-2">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold lg:text-base">
          <Plus className="h-5 w-5 flex-shrink-0" />
          New Internship Record
        </h2>
        <p className="text-xs text-foreground-soft line-clamp-2 lg:text-sm">
          Provide your placement details for review by your department head
        </p>
      </div>

      <button
        type="button"
        title={showForm ? "Hide" : "Show"}
        onClick={() => setShowForm((val) => !val)}
        className="flex flex-shrink-0 items-center gap-1 rounded-sm px-2 py-1 text-sm font-semibold transition-all hover:bg-red-100 hover:text-primary-emphasis lg:text-base"
      >
        <ChevronDown
          className={`h-5 w-5 transition-transform ${showForm ? "rotate-180" : ""}`}
        />
        <span className="hidden sm:inline">{showForm ? "Hide" : "Show"}</span>
      </button>
    </div>
  );
}

export default InternshipRecordFormHeader;
