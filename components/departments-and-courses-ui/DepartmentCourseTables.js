"use client";

import { Pencil, Power } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cx } from "@/lib/utils";

function LoadingRows() {
  return Array.from({ length: 4 }, (_, index) => (
    <tr key={index} className="border-b border-border last:border-0 max-2xl:block max-2xl:rounded-xl max-2xl:border max-2xl:bg-card max-2xl:shadow-sm">
      <td colSpan={5} className="px-5 py-3 max-2xl:block max-2xl:p-4">
        <Skeleton className="h-5 w-full max-2xl:mb-3" />
        <Skeleton className="hidden h-4 w-2/3 max-2xl:block" />
      </td>
    </tr>
  ));
}

function StatusBadge({ active }) {
  return (
    <span
      className={cx(
        "rounded-full px-2.5 py-1 text-xs font-medium",
        active ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground",
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function RowActions({ active, pending, onEdit, onToggle }) {
  return (
    <td className="px-5 py-3 text-right max-2xl:col-span-2 max-2xl:flex max-2xl:gap-2 max-2xl:border-t max-2xl:border-border max-2xl:p-0 max-2xl:pt-3">
      <button
        type="button"
        onClick={onEdit}
        className="mr-2 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium max-2xl:mr-0 max-2xl:min-h-9 max-2xl:flex-1 max-2xl:justify-center"
      >
        <Pencil className="size-3.5" /> Edit
      </button>
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 disabled:opacity-50 max-2xl:min-h-9 max-2xl:flex-1 max-2xl:justify-center"
      >
        <Power className="size-3.5" />
        {active ? "Deactivate" : "Activate"}
      </button>
    </td>
  );
}

function TableFrame({
  detailLabel, isPending, showEmpty, empty, emptyMessage, children,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm max-2xl:overflow-visible max-2xl:border-0 max-2xl:bg-transparent max-2xl:shadow-none">
      <table className="w-full text-sm max-2xl:block">
        <thead className="max-2xl:hidden">
          <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
            {["Name", "Code", detailLabel, "Status", "Actions"].map((label) => (
              <th
                key={label}
                className={label === "Actions" ? "px-5 py-3 font-medium text-right" : "px-5 py-3 font-medium"}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-2xl:grid max-2xl:gap-3 lg:max-2xl:grid-cols-2">
          {isPending ? <LoadingRows /> : children}
          {!isPending && showEmpty && empty && (
            <tr className="max-2xl:col-span-full max-2xl:block max-2xl:rounded-xl max-2xl:border max-2xl:border-border max-2xl:bg-card">
              <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground max-2xl:block">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function DepartmentsTable({
  departments, isPending, showEmpty, courseCountByDept,
  pendingIds, onEdit, onToggle,
}) {
  return (
    <TableFrame
      detailLabel="Courses"
      isPending={isPending}
      showEmpty={showEmpty}
      empty={departments.length === 0}
      emptyMessage="No departments found."
    >
      {departments.map((d) => (
        <tr key={d.id} className="border-b border-border last:border-0 max-2xl:grid max-2xl:min-w-0 max-2xl:grid-cols-2 max-2xl:gap-x-3 max-2xl:gap-y-4 max-2xl:rounded-xl max-2xl:border max-2xl:bg-card max-2xl:p-4 max-2xl:shadow-sm">
          <td className="px-5 py-3 font-medium text-foreground max-2xl:col-span-2 max-2xl:p-0 max-2xl:text-base max-2xl:leading-snug">
            {d.name}
          </td>
          <td className="px-5 py-3 text-muted-foreground max-2xl:p-0 max-2xl:text-foreground">
            <span className="mb-1 block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground 2xl:hidden">Code</span>
            {d.code}
          </td>
          <td className="px-5 py-3 text-muted-foreground max-2xl:p-0 max-2xl:text-foreground">
            <span className="mb-1 block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground 2xl:hidden">Courses</span>
            {courseCountByDept[d.id] || 0} courses
          </td>
          <td className="px-5 py-3 max-2xl:col-span-2 max-2xl:p-0">
            <span className="mr-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground 2xl:hidden">Status</span>
            <StatusBadge active={d.is_active} />
          </td>
          <RowActions
            active={d.is_active}
            pending={pendingIds.has(`department:${d.id}`)}
            onEdit={() => onEdit(d)}
            onToggle={() => onToggle(d)}
          />
        </tr>
      ))}
    </TableFrame>
  );
}

export function CoursesTable({
  courses, isPending, showEmpty, departmentNameById,
  pendingIds, onEdit, onToggle,
}) {
  return (
    <TableFrame
      detailLabel="Department"
      isPending={isPending}
      showEmpty={showEmpty}
      empty={courses.length === 0}
      emptyMessage="No courses found."
    >
      {courses.map((c) => (
        <tr key={c.id} className="border-b border-border last:border-0 max-2xl:grid max-2xl:min-w-0 max-2xl:grid-cols-2 max-2xl:gap-x-3 max-2xl:gap-y-4 max-2xl:rounded-xl max-2xl:border max-2xl:bg-card max-2xl:p-4 max-2xl:shadow-sm">
          <td className="px-5 py-3 font-medium text-foreground max-2xl:col-span-2 max-2xl:p-0 max-2xl:text-base max-2xl:leading-snug">
            {c.course_name}
          </td>
          <td className="px-5 py-3 text-muted-foreground max-2xl:p-0 max-2xl:text-foreground">
            <span className="mb-1 block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground 2xl:hidden">Code</span>
            {c.code || c.short_name}
          </td>
          <td className="px-5 py-3 text-muted-foreground max-2xl:min-w-0 max-2xl:break-words max-2xl:p-0 max-2xl:text-foreground">
            <span className="mb-1 block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground 2xl:hidden">Department</span>
            {departmentNameById[c.department_id] || "—"}
          </td>
          <td className="px-5 py-3 max-2xl:col-span-2 max-2xl:p-0">
            <span className="mr-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground 2xl:hidden">Status</span>
            <StatusBadge active={c.is_active} />
          </td>
          <RowActions
            active={c.is_active}
            pending={pendingIds.has(`course:${c.id}`)}
            onEdit={() => onEdit(c)}
            onToggle={() => onToggle(c)}
          />
        </tr>
      ))}
    </TableFrame>
  );
}
