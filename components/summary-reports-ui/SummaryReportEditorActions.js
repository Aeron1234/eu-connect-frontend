"use client";

import { primaryButton, secondaryButton } from "./summaryReportFields";

export default function SummaryReportEditorActions({ record, words, mutation, onCancel }) {
  return (
    <div
      className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className={`text-xs ${words > 900 ? "text-red-600" : "text-foreground-soft"}`}>{words} / 900 words. Use Times New Roman, 12 pt, 1.5 spacing, 1-inch margins, and no more than 3 pages in the final report.</p>
      <div className="flex flex-wrap gap-2">
        {record.report_id && <button type="button" onClick={onCancel} className={secondaryButton}>Cancel</button>}
        <button type="submit" disabled={mutation.isPending || words > 900} className={primaryButton}>{mutation.isPending ? "Saving..." : record.report_id ? "Save changes" : "Submit report"}</button>
      </div>
    </div>
  );
}
