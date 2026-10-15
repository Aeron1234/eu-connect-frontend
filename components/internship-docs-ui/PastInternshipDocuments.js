"use client";

import { Building2 } from "lucide-react";
import RecordRow from "./PastInternshipDocumentRow";
import usePastInternshipDocuments from "./usePastInternshipDocuments";

function PastInternshipDocuments({ records = [], currentUserId = "" }) {
  const pastRecords = usePastInternshipDocuments(records, currentUserId);
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
