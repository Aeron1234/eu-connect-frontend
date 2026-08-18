"use client";

import { useMemo, useState } from "react";
import InternshipRequirementsType from "./InternshipRequirementsType";
import { LayoutGrid, ListIcon, Search } from "lucide-react";
import SearchedStudentFiles from "./SearchedStudentFiles";

import {
  FILE_TYPE_LABELS,
  TYPE_TONES,
  getFileTypeLabel,
  typeTone,
} from "@/lib/utils";

function RecordsDocuments({
  fileData = [],
  requirementTypes = [],
  internshipId,
  userRole = "",
}) {
  const docs = fileData;
  const isOngoing = docs.status === "ongoing";

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const [hide, setHide] = useState(!isOngoing);

  const filtered = useMemo(() => {
    let result = docs ? [...docs] : [];

    if (query.trim()) {
      result = result.filter((d) =>
        d.file_name.toLowerCase().includes(query.trim().toLowerCase()),
      );
    }

    if (filter !== "all") {
      result = result.filter((d) => d.category === filter);
    }

    return result;
  }, [docs, filter, query]);

  console.log(docs);

  return (
    <>
      <div className="rounded-xl bg-white border border-stone-200 p-5 sm:p-6">
        <InternshipRequirementsType
          requirementTypes={requirementTypes || []}
          docs={docs}
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mt-5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { key: "all", label: "All Documents" },
            { key: "before", label: "Before Deployment" },
            { key: "after", label: "After Deployment" },
          ].map(({ key, label }) => (
            <button
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                key === filter
                  ? "bg-primary-500 text-primary-foreground border-primary-500"
                  : "bg-card text-muted-foreground border-border/60 hover:bg-muted"
              }`}
              key={key}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <div className="relative flex-1 lg:flex-none">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="h-9 w-full lg:w-56 pl-9 pr-3 rounded-lg bg-white border border-stone-200 focus:border-primary-500/40 focus:outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex rounded-lg border border-stone-200 overflow-hidden shrink-0 bg-white">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`p-2 transition-colors ${view === "grid" ? "bg-primary-500 text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`p-2 transition-colors ${view === "list" ? "bg-primary-500 text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <SearchedStudentFiles
        filtered={filtered || []}
        view={view}
        typeTone={typeTone}
        getFileTypeLabel={getFileTypeLabel}
        internshipId={internshipId}
      />
    </>
  );
}

export default RecordsDocuments;
