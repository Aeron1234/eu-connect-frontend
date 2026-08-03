"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Search,
} from "lucide-react";
import InternshipRequirementsType from "./InternshipRequirementsType";
import SearchedStudentFiles from "./SearchedStudentFiles";

const TYPE_TONES = {
  PDF: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  DOC: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DOCX: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  XLS: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  XLSX: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  CSV: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  TXT: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
  JPG: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  PNG: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  WEBP: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const FILE_TYPE_LABELS = {
  "application/pdf": "PDF",
  "text/plain": "TXT",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "text/csv": "CSV",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
};

const typeTone = (label) =>
  TYPE_TONES[label] ||
  "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300";

function getFileTypeLabel(mimeType = "") {
  return (
    FILE_TYPE_LABELS[mimeType] ||
    mimeType.split("/")[1]?.toUpperCase() ||
    "FILE"
  );
}

function StudentDocuments({
  searchedUserId,
  fileData = {},
  requirementTypes = [],
  userRole = "",
}) {
  const docs = fileData;
  const isOngoing = docs.status === "ongoing";

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const [hide, setHide] = useState(!isOngoing);

  const filtered = useMemo(() => {
    let result = docs?.files ? [...docs.files] : [];

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

  return (
    <div className="p-5 space-y-5">
      {/* Requirement completion checklist */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-primary-500">
              Requirement Completion
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Official OJT requirement checklist{" "}
              {docs?.company_name ? (
                <>
                  ·{" "}
                  <span className="font-semibold text-primary-500">
                    {docs.company_name}
                  </span>
                </>
              ) : null}
            </p>
          </div>

          <div>
            {hide && (
              <button
                onClick={() => setHide((h) => !h)}
                className="text-xs text-primary hover:underline"
              >
                View Details{" "}
                <ChevronDown className="w-3.5 h-3.5 inline-block ml-1" />
              </button>
            )}
            <p className="text-xs text-muted-foreground">
              {docs.submittedCount} of {docs.totalRequirements} submitted ·{" "}
              {docs.completionPercent}%
            </p>
          </div>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-500 transition-all"
            style={{ width: `${docs.completionPercent}%` }}
          />
        </div>

        <InternshipRequirementsType
          requirementTypes={requirementTypes || []}
          docs={docs}
        />

        {/* Toolbar */}
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
                className="h-9 w-full lg:w-56 pl-9 pr-3 rounded-lg bg-muted/50 border border-transparent focus:border-primary/40 focus:bg-card focus:outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex rounded-lg border border-border/60 overflow-hidden shrink-0">
              <button
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={`p-2 transition-colors ${view === "grid" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                aria-label="List view"
                className={`p-2 transition-colors ${view === "list" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Document list */}
        {!hide && (
          <SearchedStudentFiles
            filtered={filtered || []}
            view={view}
            typeTone={typeTone}
            getFileTypeLabel={getFileTypeLabel}
            userRole={userRole}
            searchedUserId={searchedUserId}
          />
        )}
      </div>
    </div>
  );
}

export default StudentDocuments;
