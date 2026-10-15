"use client";

import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { parseDay } from "./calendarDateUtils";
import CalendarAgendaItem from "./CalendarAgendaItem";

export default function CalendarAgenda({
  agendaRef,
  selected,
  canAddTodo,
  setEditor,
  monthQuery,
  entries,
  canSchedule,
  role,
  user,
  busy,
  mutate,
  setDeletingEntry,
}) {
  return (
    <section
      ref={agendaRef}
      className="scroll-mt-20 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-5"
      aria-label="Selected day agenda"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-emphasis">
            Day agenda
          </p>
          <h2 className="text-sm font-bold text-foreground sm:text-lg">
            {format(parseDay(selected), "EEEE, MMMM d, yyyy")}
          </h2>
        </div>
        {canAddTodo && <button
            type="button"
            onClick={() => setEditor({ kind: "todo", item: null })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-emphasis hover:underline sm:text-sm"
          >
            <Plus className="size-4" />
            {" Add to-do"}
          </button>}
      </div>
      {monthQuery.isPending ? <div
          className="space-y-2"
          role="status"
          aria-label="Loading this day"
        >
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div> : entries.length === 0 ? <p className="rounded-xl bg-muted/45 p-4 text-xs text-foreground-soft sm:text-sm">
          Nothing scheduled for this day.
        </p> : <div className="space-y-2">
          {entries.map((entry) => <CalendarAgendaItem
              key={entry.key}
              entry={entry}
              canSchedule={canSchedule}
              role={role}
              user={user}
              busy={busy}
              mutate={mutate}
              setEditor={setEditor}
              setDeletingEntry={setDeletingEntry}
            />)}
        </div>}
    </section>
  );
}
