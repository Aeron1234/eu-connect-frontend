"use client";

import { format } from "date-fns";
import { ChevronDown, Building2 } from "lucide-react";
import SearchedStudentFiles from "./SearchedStudentFiles";
import StatusPill from "./PastInternshipStatusPill";
import PastInternshipFilesSkeleton from "./PastInternshipFilesSkeleton";
import usePastInternshipFiles from "./usePastInternshipFiles";
import { downloadInternshipFile } from "@/lib/server-actions/internship-docs-actions";
import { getFileTypeLabel, typeTone } from "@/lib/utils";

export default function PastInternshipDocumentRow({ record, currentUserId }) {
  const { expanded, setExpanded, filesQuery, handleFilesChanged } = usePastInternshipFiles(record, currentUserId);

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-emphasis"
          >
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
          {filesQuery.isPending ? (
            <PastInternshipFilesSkeleton />
          ) : filesQuery.isError && !filesQuery.data ? (
            <div role="alert" className="p-4 text-sm text-foreground">
              <p>{filesQuery.error?.message || "Could not load files. Please try again."}</p>
              <button
                type="button"
                className="mt-2 font-semibold text-primary-emphasis"
                onClick={() => void filesQuery.refetch()}
              >
                Try again
              </button>
            </div>
          ) : (
            <SearchedStudentFiles
              filtered={filesQuery.data || []}
              view="list"
              typeTone={typeTone}
              getFileTypeLabel={getFileTypeLabel}
              internshipId={record.id}
              userRole="student"
              currentUserId={currentUserId}
              downloadAction={downloadInternshipFile}
              onChanged={handleFilesChanged}
            />
          )}
        </div>
      )}
    </div>
  );
}
