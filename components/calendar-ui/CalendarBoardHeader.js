"use client";

import { CalendarDays, Plus } from "lucide-react";
import CalendarHelp from "./CalendarHelp";

export default function CalendarBoardHeader({ role, showManual, canSchedule, canAddTodo, setEditor }) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
            <CalendarDays className="size-6 text-primary-emphasis" />
            {" Calendar"}
          </h1>
          {showManual && (
                <CalendarHelp role={role} />
              )}
        </div>
        <p className="mt-1 text-sm text-foreground-soft">
          {role === "employer" ? "View school-wide schedules." : "Internship dates, announcements, schedules, and your daily plans."}
        </p>
      </div>
      {(canSchedule || canAddTodo) && (
            <button
          type="button"
          onClick={() => setEditor({ kind: canSchedule ? "schedule" : "todo", item: null })}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
        >
          <Plus className="size-4" />
          {" "}
          {canSchedule ? "Add schedule" : "Add to-do"}
        </button>
          )}
    </div>
  );
}
