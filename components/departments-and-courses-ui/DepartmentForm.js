"use client";

import { Building2 } from "lucide-react";

export default function DepartmentForm({
  deptName, setDeptName, deptCode, setDeptCode,
  deptError, isAddingDept, handleAddDepartment,
}) {
  return (
    <form
      onSubmit={handleAddDepartment}
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Building2 className="size-4 text-primary-emphasis" /> Add
        Department
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Department Name
          </label>
          <input
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            placeholder="College of Computer Studies"
            disabled={isAddingDept}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Code
          </label>
          <input
            value={deptCode}
            onChange={(e) => setDeptCode(e.target.value)}
            placeholder="CCS"
            disabled={isAddingDept}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
          />
        </div>
        {deptError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {deptError}
          </p>
        )}
        <button
          type="submit"
          disabled={isAddingDept}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isAddingDept ? "Adding..." : "+ Add Department"}
        </button>
      </div>
    </form>
  );
}
