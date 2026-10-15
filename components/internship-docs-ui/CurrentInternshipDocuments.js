"use client";

import RecordsDocuments from "./RecordsDocuments";
import { downloadInternshipFile } from "@/lib/server-actions/internship-docs-actions";

export default function CurrentInternshipDocuments({
  ongoing,
  requirementTypes,
  currentUserId,
}) {
  if (!ongoing) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        You don&apos;t currently have an ongoing internship.
      </div>
    );
  }

  return (
    <RecordsDocuments
      requirementTypes={requirementTypes || []}
      internshipId={ongoing.id}
      userRole="student"
      currentUserId={currentUserId}
      downloadAction={downloadInternshipFile}
    />
  );
}
