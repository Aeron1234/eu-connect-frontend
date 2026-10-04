"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, Building2 } from "lucide-react";
import SearchedStudentFiles from "./SearchedStudentFiles";
import {
  getInternshipFilesResult as getInternshipFiles,
  downloadInternshipFile,
} from "@/lib/server-actions/internship-docs-actions";

import { getFileTypeLabel, typeTone } from "@/lib/utils";

const STATUS_STYLES = {
  finished: "bg-green-50 text-green-700",
  ongoing: "bg-amber-50 text-amber-700",
  withdrawn: "bg-muted text-foreground-soft",
};

function StatusPill({ status }) {
  const key = (status || "").toLowerCase();
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[key] || STATUS_STYLES.withdrawn}`}
    >
      {status}
    </span>
  );
}

function RecordRow({ record, currentUserId }) {
  const [expanded, setExpanded] = useState(false);
  const [docs, setDocs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  async function loadDocs() {
    setIsLoading(true);
    try {
      const result = await getInternshipFiles({ internshipId: record.id });
      setLoadError(result?.error || "");
      if (Array.isArray(result)) setDocs(result);
    } catch {
      setLoadError("Could not load files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (docs === null) await loadDocs();
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-emphasis">
            <Building2 className="size-4" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-foreground truncate">
              {record.company_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {record.internship_position} ·{" "}
              {record.date_started &&
                format(new Date(record.date_started), "MMM yyyy")}
              {record.date_ended
                ? ` – ${format(new Date(record.date_ended), "MMM yyyy")}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusPill status={record.status} />
          <span className="text-xs text-muted-foreground">
            {record.file_count} files
          </span>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/60 p-3">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading files...
            </div>
          ) : loadError ? (
            <div role="alert" className="p-4 text-sm text-foreground">
              <p>{loadError}</p>
              <button type="button" className="mt-2 font-semibold text-primary-emphasis" onClick={loadDocs}>
                Try again
              </button>
            </div>
          ) : (
            <SearchedStudentFiles
              filtered={docs || []}
              view="list"
              typeTone={typeTone}
              getFileTypeLabel={getFileTypeLabel}
              internshipId={record.id}
              userRole="student"
              currentUserId={currentUserId}
              downloadAction={downloadInternshipFile}
            />
          )}
        </div>
      )}
    </div>
  );
}

function PastInternshipDocuments({ records = [], currentUserId = "" }) {
  if (records.length === 0) return null;

  const totalFiles = records.reduce(
    (sum, r) => sum + Number(r.file_count || 0),
    0,
  );

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold text-primary-emphasis">
        <Building2 className="size-4" />
        Past Internship Records
        <span className="text-sm font-normal text-muted-foreground">
          {records.length} records · {totalFiles} files
        </span>
      </h3>
      <div className="space-y-2">
        {records.map((record) => (
          <RecordRow
            key={record.id}
            record={record}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}

export default PastInternshipDocuments;
