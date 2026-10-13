"use client";

import { useState } from "react";
import { FileText, Paperclip } from "lucide-react";
import Image from "next/image";
import { getInternshipRecordSummaryAttachmentUrl } from "@/lib/server-actions/summary-reports-actions";

const sections = [
  ["organization_experience", "Working in the organization / company"],
  ["work_schedule", "Work schedule"],
  ["memorable_moment", "Most memorable practicum moment"],
  ["difficulties_solutions", "Difficulties and solutions"],
];

export default function RecordsSummaryReport({ report }) {
  const [attachmentError, setAttachmentError] = useState("");

  async function openAttachment() {
    const tab = window.open("", "_blank");
    setAttachmentError("");
    const result = await getInternshipRecordSummaryAttachmentUrl(report.internship_id);
    if (result?.success && result.url) {
      if (tab) tab.location.href = result.url;
      else window.location.href = result.url;
    } else {
      tab?.close();
      setAttachmentError(result?.error || "Could not open the attachment.");
    }
  }

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
      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map(([key, title], index) => (
          <section key={key} className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary-emphasis">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-sm font-semibold text-foreground sm:text-base">{title}</h3>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground-soft">{report[key]}</p>
          </section>
        ))}
      </div>
      {(report.memorabilia_note || report.attachment_name || report.images?.length) && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground sm:text-base">Picture or multimedia memorabilia</h3>
          {report.memorabilia_note && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground-soft">{report.memorabilia_note}</p>}
          {report.images?.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {report.images.map((image) => (
                <a key={image.id} href={image.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-border bg-canvas">
                  <Image unoptimized src={image.url} alt="Internship memorabilia" width={320} height={240} className="h-32 w-full object-contain" />
                </a>
              ))}
            </div>
          )}
          {report.attachment_name && (
            <button type="button" onClick={openAttachment} className="mt-3 inline-flex max-w-full items-center gap-2 break-all rounded-lg border border-border bg-canvas px-3 py-2 text-left text-sm font-medium text-primary-emphasis hover:bg-muted">
              <Paperclip className="size-4 shrink-0" aria-hidden="true" />{report.attachment_name}
            </button>
          )}
          {attachmentError && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-300">{attachmentError}</p>}
        </section>
      )}
    </article>
  );
}
