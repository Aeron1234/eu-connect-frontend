"use client";

import { cx } from "@/lib/utils";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

function initialsOf(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function AlumniCompanies({
  company,
  handleItemDelete = null,
  handleItemUpdate = null,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card hover:shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="text-base font-semibold text-foreground">
              {company.company_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {company.company_address} · {company.industry}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            {company.alumni_count}{" "}
            {company.alumni_count === 1 ? "alumnus" : "alumni"}
          </span>
          <ChevronDown
            className={cx(
              "size-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border">
          {company.alumni.map((a) => (
            <AlumniRow
              key={a.id}
              alumni={a}
              batch={a.academic_year.split("-")[1]}
              onUpdate={handleItemUpdate}
              onDelete={handleItemDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AlumniRow({ alumni, batch, handleItemDelete, handleItemUpdate }) {
  const [open, setOpen] = useState(false);
  const pct = alumni.total_hours
    ? Math.min(
        100,
        Math.round((alumni.accumulated_hours / alumni.total_hours) * 100),
      )
    : 0;

  return (
    <div className="border-t border-border first:border-t-0">
      <div className="flex w-full items-center justify-between gap-3 px-5 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-primary-500/10 text-xs font-semibold text-primary">
              {initialsOf(alumni.alumni_name)}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {alumni.alumni_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {alumni.course_name} · Batch {batch}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cx(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        <div className="flex gap-3">
          <div
            aria-label={`Edit record`}
            title="Edit record"
            className="text-muted-foreground hover:text-primary-500"
          >
            <Pencil className="h-4 w-4" />
          </div>

          <div
            title="Delete record"
            aria-label={`Delete record`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </div>
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Position</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {alumni.internship_position || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Supervisor</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {alumni.supervisor_name || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hours</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {Number(alumni.accumulated_hours.toFixed(1))} /{" "}
                {alumni.total_hours} hrs
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {alumni.notes || "—"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {pct}% hours completed
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlumniCompanies;
