"use client";

import { FileText, Pencil, Trash2 } from "lucide-react";
import ExportPdfButton from "../ui/ExportPdfButton";
import AnnexCEntriesTable from "./AnnexCEntriesTable";

export default function AnnexCReportCard({
  report: r, editingReportId, resetForm, editDraft, setConfirmation, form,
}) {
  return (
    <section
      key={r.id}
      className="@container overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <header className="relative border-b border-border px-4 py-4 sm:px-5">
        <div className={`grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 ${r.status === "draft" ? "@2xl:pr-72" : "@2xl:pr-48"}`}>
          <span className="col-start-1 row-start-1 grid size-9 place-items-center rounded-lg bg-primary-50 text-primary-emphasis">
            <FileText className="size-4" />
          </span>
          <div className="col-span-2 row-start-2 min-w-0 @2xl:col-span-1 @2xl:col-start-2 @2xl:row-start-1">
            <p className="text-sm font-semibold text-foreground">
              Annex &quot;C&quot; — SIPP Annual Report
            </p>
            <p className="text-xs text-muted-foreground truncate">
              AY {r.academic_year} · {r.degree_program} ·{" "}
              {r.status === "submitted" && r.submitted_at
                ? `Submitted ${new Date(r.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                : "Draft"}
              {r.prepared_by
                ? ` · By ${r.prepared_by.split(",")[0]}`
                : ""}
            </p>
          </div>
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-5">
          {r.status === "draft" && (
            <button
              type="button"
              onClick={() => editingReportId === r.id ? resetForm() : editDraft(r)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-primary-emphasis hover:bg-primary-50"
              aria-expanded={editingReportId === r.id}
              aria-label={editingReportId === r.id ? "Close editor" : "Edit draft"}
            >
              <Pencil className="size-3.5" /> <span className="hidden sm:inline">{editingReportId === r.id ? "Close editor" : "Edit draft"}</span>
            </button>
          )}
          <ExportPdfButton
            endpoint="/api/reports/annex-c"
            params={{ reportId: r.id }}
          />
          <button
            onClick={() => setConfirmation({ kind: "delete", id: r.id })}
            className="rounded-md p-2 text-foreground-subtle hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete report"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </header>

      {editingReportId === r.id ? (
        <div className="bg-background p-4 sm:p-5">{form}</div>
      ) : (
        <>

          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 text-sm">
            <p>
              <span className="text-muted-foreground">
                Degree Program:{" "}
              </span>
              <span className="font-semibold text-foreground">
                {r.degree_program}
              </span>
            </p>
            {r.prepared_by && (
              <p className="text-muted-foreground">
                Prepared By:{" "}
                <span className="text-foreground">{r.prepared_by}</span>
              </p>
            )}
          </div>
    
          <AnnexCEntriesTable report={r} />
        </>
      )}
    </section>
  );
}
