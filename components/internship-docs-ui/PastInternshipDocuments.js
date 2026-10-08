"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronDown, Building2 } from "lucide-react";
import SearchedStudentFiles from "./SearchedStudentFiles";
import { downloadInternshipFile } from "@/lib/server-actions/internship-docs-actions";
import {
  pastInternshipDocumentsKeys,
  pastInternshipFilesOptions,
  pastInternshipRecordsOptions,
} from "@/lib/cache/past-internship-documents-queries";

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
  const queryClient = useQueryClient();
  const filesQuery = useQuery({
    ...pastInternshipFilesOptions(currentUserId, record.id),
    enabled: expanded && Boolean(currentUserId),
  });

  function handleFilesChanged({ type, fileId }) {
    const filesKey = pastInternshipDocumentsKeys.files(currentUserId, record.id);
    const recordsKey = pastInternshipDocumentsKeys.records(currentUserId);
    if (type === "deleted") {
      queryClient.setQueryData(filesKey, (files) =>
        files?.filter((file) => String(file.id) !== String(fileId)),
      );
      queryClient.setQueryData(recordsKey, (records) => records?.map((item) =>
        String(item.id) === String(record.id)
          ? { ...item, file_count: Math.max(0, Number(item.file_count || 0) - 1) }
          : item,
      ));
    } else if (type === "approved") {
      queryClient.setQueryData(filesKey, (files) => files?.map((file) =>
        String(file.id) === String(fileId)
          ? { ...file, verification_status: "accepted" }
          : file,
      ));
    }
    void queryClient.invalidateQueries({ queryKey: filesKey });
    if (type === "deleted") {
      void queryClient.invalidateQueries({ queryKey: recordsKey });
    }
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
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
          {filesQuery.isPending ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading files...
            </div>
          ) : filesQuery.isError && !filesQuery.data ? (
            <div role="alert" className="p-4 text-sm text-foreground">
              <p>{filesQuery.error?.message || "Could not load files. Please try again."}</p>
              <button type="button" className="mt-2 font-semibold text-primary-emphasis" onClick={() => void filesQuery.refetch()}>
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

function PastInternshipDocuments({ records = [], currentUserId = "" }) {
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(records);
  const recordsQuery = useQuery({
    ...pastInternshipRecordsOptions(currentUserId),
    enabled: Boolean(currentUserId),
    initialData: records,
  });

  useEffect(() => {
    if (serverSnapshotRef.current === records || !currentUserId) return;
    serverSnapshotRef.current = records;
    queryClient.setQueryData(pastInternshipDocumentsKeys.records(currentUserId), records);
  }, [records, queryClient, currentUserId]);

  const pastRecords = recordsQuery.data || [];
  if (pastRecords.length === 0) return null;

  const totalFiles = pastRecords.reduce(
    (sum, r) => sum + Number(r.file_count || 0),
    0,
  );

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold text-primary-emphasis">
        <Building2 className="size-4" />
        Past Internship Records
        <span className="text-sm font-normal text-muted-foreground">
          {pastRecords.length} records · {totalFiles} files
        </span>
      </h3>
      <div className="space-y-2">
        {pastRecords.map((record) => (
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
