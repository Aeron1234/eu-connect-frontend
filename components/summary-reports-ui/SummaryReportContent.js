"use client";

import { Paperclip } from "lucide-react";
import { getSummaryAttachmentUrl } from "@/lib/server-actions/summary-reports-actions";
import SummaryReportSections from "./SummaryReportSections";
import SummaryReportImages from "./SummaryReportImages";
import useSummaryAttachment from "./useSummaryAttachment";

export default function SummaryReportContent({ record }) {
  const { attachmentError, openAttachment } = useSummaryAttachment(record.internship_id, getSummaryAttachmentUrl, false, { filename: record.attachment_name, mimeType: record.attachment_type });

  return (
    <article className="space-y-5">
      <SummaryReportSections record={record} />
      {(record.memorabilia_note || record.attachment_name || record.images?.length) && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-3">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary-emphasis"
            >05</span>
            <h3 className="text-sm font-semibold text-foreground sm:text-base">Picture or multimedia memorabilia</h3>
          </div>
          {record.memorabilia_note && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground-soft">{record.memorabilia_note}</p>}
          {record.images?.length > 0 && (
            <SummaryReportImages images={record.images} />
          )}
          {record.attachment_name && (
            <button
              type="button"
              onClick={openAttachment}
              className="mt-3 inline-flex max-w-full items-center gap-2 break-all rounded-lg border border-border bg-canvas px-3 py-2 text-left text-sm font-medium text-primary-emphasis hover:bg-muted"
            >
              <Paperclip className="size-4 shrink-0" aria-hidden="true" />{record.attachment_name}
            </button>
          )}
          {attachmentError && <p role="alert" className="mt-2 text-sm text-red-600">{attachmentError}</p>}
        </section>
      )}
    </article>
  );
}
