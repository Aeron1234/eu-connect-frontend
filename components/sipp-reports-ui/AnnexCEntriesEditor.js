"use client";

import { FileText, Plus, Trash2 } from "lucide-react";

export default function AnnexCEntriesEditor({ rows, addRow, updateRow, removeRow }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="size-4 text-primary-emphasis" /> Issues,
          Solutions &amp; Recommendations
        </h3>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground-soft hover:bg-muted transition-colors"
        >
          <Plus className="size-3.5" /> Add Row
        </button>
      </div>

      {/* Column headers — only shown at sm+, where the 3-column layout applies */}
      <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_auto] gap-3 border-b border-border pb-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        <span>Issues and Concerns Encountered</span>
        <span>Solutions</span>
        <span>Recommendations</span>
        <span />
      </div>

      <div className="space-y-4 sm:space-y-3 pt-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="rounded-lg border border-border p-3 sm:border-0 sm:p-0 sm:rounded-none grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3"
          >
            <div className="flex flex-col gap-1 sm:contents">
              <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">
                Issues and Concerns Encountered
              </span>
              <textarea
                value={row.issue}
                onChange={(e) => updateRow(i, "issue", e.target.value)}
                placeholder="Describe the issue or concern..."
                rows={2}
                className="rounded-md border border-border bg-card p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-1 sm:contents">
              <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">
                Solutions
              </span>
              <textarea
                value={row.solution}
                onChange={(e) => updateRow(i, "solution", e.target.value)}
                placeholder="Describe the solution applied..."
                rows={2}
                className="rounded-md border border-border bg-card p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-1 sm:contents">
              <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">
                Recommendations
              </span>
              <textarea
                value={row.recommendation}
                onChange={(e) =>
                  updateRow(i, "recommendation", e.target.value)
                }
                placeholder="Recommendations for improvement..."
                rows={2}
                className="rounded-md border border-border bg-card p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              />
            </div>

            <button
              type="button"
              onClick={() => removeRow(i)}
              className="self-start sm:self-start text-foreground-subtle hover:text-red-600 transition-colors justify-self-end sm:justify-self-auto"
              title="Remove row"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
