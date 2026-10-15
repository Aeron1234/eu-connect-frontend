"use client";

import ExportPdfButton from "../ui/ExportPdfButton";
import AnnexDInternTable from "./AnnexDInternTable";

export default function AnnexDCompanyCard({ company: c }) {
  return (
    <section
      key={c.company_key}
      className="@container overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-border px-4 py-4 sm:px-5 @2xl:grid-cols-[auto_minmax(0,1fr)_auto]">
        <span className="col-start-1 row-start-1 grid size-9 place-items-center rounded-lg bg-primary-50 text-xs font-semibold text-primary-emphasis">
          {c.company_name.slice(0, 2).toUpperCase()}
        </span>
        <div className="col-span-2 row-start-2 min-w-0 @2xl:col-span-1 @2xl:col-start-2 @2xl:row-start-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {c.company_name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {c.company_address}
          </p>
        </div>
        <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-2 @2xl:col-start-3">
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-emphasis">
            {c.intern_count}{" "}
            {c.intern_count === 1 ? "intern" : "interns"}
          </span>
          <ExportPdfButton
            endpoint="/api/reports/annex-d"
            params={{
              companyKey: c.company_key,
              academicYear: c.academic_year,
            }}
          />
        </div>
      </header>
      <AnnexDInternTable company={c} />
    </section>
  );
}
