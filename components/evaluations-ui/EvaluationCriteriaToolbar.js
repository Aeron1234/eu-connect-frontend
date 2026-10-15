"use client";

import { cx } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const FORM_TYPES = [
  { value: "student", label: "Student" },
  { value: "employer", label: "Employer" },
];

export default function EvaluationCriteriaToolbar({
  formType, handleTypeChange, isPending, totals, filter, setFilter,
}) {
  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg bg-secondary p-1">
          {FORM_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTypeChange(t.value)}
              disabled={isPending}
              className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap flex-1 text-center disabled:opacity-50 ${
                formType === t.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary-emphasis"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6 text-sm">
          <Stat label="Sections" value={totals.sections} />
          <Stat label="Active Criteria" value={totals.criteria} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cx(
              "rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-primary-emphasis",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-primary-emphasis">{value}</p>
    </div>
  );
}
