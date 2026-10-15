"use client";

import { FileText, Paperclip } from "lucide-react";
import {
  getInternshipRecordSummaryAttachmentUrl,
} from "@/lib/server-actions/summary-reports-actions";
import SummaryReportSections from "./SummaryReportSections";
import SummaryReportImages from "./SummaryReportImages";
import useSummaryAttachment from "./useSummaryAttachment";

export default function RecordsSummaryReport({ report }) {
  const { attachmentError, openAttachment } = useSummaryAttachment(report?.internship_id, getInternshipRecordSummaryAttachmentUrl, true);

  if (!report) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <FileText className="mx-auto size-8 text-primary-emphasis" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted-foreground">No summary report has been submitted for this internship.</p>
      </div>
    );
  }

  return (
    <article className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">Summary Report</h2>
        <p className="mt-1 text-sm text-foreground-soft">Prepared by {report.student_name || "Student"} for {report.company_name}</p>
      </div>
      <SummaryReportSections record={report} className="grid gap-4 lg:grid-cols-2" />
      {(report.memorabilia_note || report.attachment_name || report.images?.length) && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground sm:text-base">Picture or multimedia memorabilia</h3>
          {report.memorabilia_note && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground-soft">{report.memorabilia_note}</p>}
          {report.images?.length > 0 && (
            <SummaryReportImages images={report.images} />
          )}
          {report.attachment_name && (
            <button
              type="button"
              onClick={openAttachment}
              className="mt-3 inline-flex max-w-full items-center gap-2 break-all rounded-lg border border-border bg-canvas px-3 py-2 text-left text-sm font-medium text-primary-emphasis hover:bg-muted"
            >
              <Paperclip className="size-4 shrink-0" aria-hidden="true" />{report.attachment_name}
            </button>
          )}
          {attachmentError && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-300">{attachmentError}</p>}
        </section>
      )}
    </article>
  );
}
