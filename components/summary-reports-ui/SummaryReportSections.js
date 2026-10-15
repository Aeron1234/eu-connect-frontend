"use client";

import { SECTIONS } from "./summaryReportFields";

export default function SummaryReportSections({ record, className = "grid gap-4 lg:grid-cols-2 lg:gap-6" }) {
  return (
    <div className={className}>
      {SECTIONS.map(({ key, title }, index) => (
        <section key={key} className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-3">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary-emphasis"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-sm font-semibold text-foreground sm:text-base">{title}</h3>
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground-soft">{record[key]}</p>
        </section>
      ))}
    </div>
  );
}
