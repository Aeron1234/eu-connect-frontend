"use client";

import { FileText } from "lucide-react";
import AnnexCEntriesEditor from "./AnnexCEntriesEditor";

export default function AnnexCReportForm({
  hei, address, academicYear, setAcademicYear, degreeProgram, setDegreeProgram,
  rows, addRow, updateRow, removeRow, preparedBy, setPreparedBy,
  certifiedBy, setCertifiedBy, formError, editingReportId, isSaving,
  resetForm, handleSubmit,
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="size-4 text-primary-emphasis" /> Annex
          &quot;C&quot; — Header Information
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Academic Year (AY) <span className="text-red-600">*</span>
            </label>
            <input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. 2026-2027"
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Degree Program <span className="text-red-600">*</span>
            </label>
            <input
              value={degreeProgram}
              onChange={(e) => setDegreeProgram(e.target.value)}
              placeholder="e.g. BS Computer Science"
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 rounded-lg bg-muted/50 px-4 py-3 md:grid-cols-2">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
              HEI
            </p>
            <p className="text-sm text-foreground">{hei}</p>
          </div>
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
              Address
            </p>
            <p className="text-sm text-foreground">{address}</p>
          </div>
        </div>
      </section>

      <AnnexCEntriesEditor rows={rows} addRow={addRow} updateRow={updateRow} removeRow={removeRow} />

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Signatories
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Prepared By (Name &amp; Position){" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="Full name of the preparer"
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Certified Correct (Name &amp; Position)
            </label>
            <input
              value={certifiedBy}
              onChange={(e) => setCertifiedBy(e.target.value)}
              placeholder="Full name of the certifier"
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {formError && (
        <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-3">
        {editingReportId && (
          <button type="button" onClick={resetForm} disabled={isSaving} className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50">
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSubmit("draft")}
          disabled={isSaving}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground-soft hover:bg-muted transition-colors disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("submitted")}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Submit Annex C"}
        </button>
      </div>
    </div>
  );
}
