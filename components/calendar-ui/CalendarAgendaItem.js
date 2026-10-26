"use client";

import Link from "next/link";
import { CalendarDays, Check, Pencil, Trash2 } from "lucide-react";
import { updateCalendarTodo } from "@/lib/server-actions/calendar-actions";
import { kinds } from "./calendarKinds";
import TodoPreview from "./TodoPreview";

export default function CalendarAgendaItem({ entry, canSchedule, role, user, busy, mutate, setEditor, setDeletingEntry }) {
  const meta = kinds.find((kind) => kind.id === entry.kind);
  const Icon = meta.icon;
  // Admins can manage visible schedules; heads manage their authored schedules.
  // The API repeats those checks. Private to-do controls follow a separate branch.
  const editable = canSchedule && entry.kind === "schedule" && (role === "admin" || String(entry.source.created_by) === String(user.id));
  return (
    <div
      key={entry.key}
      className={`flex min-w-0 items-start gap-2 rounded-xl border p-2.5 text-[11px] sm:gap-3 sm:p-3 sm:text-sm ${meta.chip}`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          {entry.kind === "todo" ? <TodoPreview
              title={entry.title}
              done={entry.done}
            /> : <span
              className={`min-w-0 break-words font-semibold ${entry.kind === "announcement" ? "line-clamp-2" : ""}`}
            >
              {entry.title}
            </span>}
          <span className="text-[10px] opacity-75 sm:text-[11px]">
            {meta.label}
          </span>
        </div>
        {entry.subtitle && <p className="mt-0.5 text-[10px] opacity-80 sm:text-xs">
            {entry.subtitle}
          </p>}
        {entry.rangeLabel && (
          <p className="mt-1 flex items-start gap-1.5 text-[10px] font-medium sm:text-xs">
            <CalendarDays className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">{entry.rangeLabel}</span>
          </p>
        )}
        {entry.detail && <p
            className={`mt-1 break-words text-[11px] opacity-85 sm:text-sm ${entry.kind === "announcement" ? "line-clamp-3 whitespace-normal" : "whitespace-pre-wrap"}`}
          >
            {entry.detail}
          </p>}
        {entry.href && <Link
            href={entry.href}
            className="mt-1 inline-block text-[11px] font-semibold underline sm:text-xs"
          >
            View details
          </Link>}
      </div>
      {entry.kind === "todo" && <button
          type="button"
          disabled={busy}
          onClick={() => void mutate(() => updateCalendarTodo(entry.source.id, { is_done: !entry.done }), entry.done ? "Marked as pending." : "To-do completed.")}
          aria-label={entry.done ? "Mark to-do pending" : "Complete to-do"}
          className="rounded-md border border-current/25 p-1"
        >
          <Check className="size-4" />
        </button>}
      {(editable || entry.kind === "todo") && <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setEditor({ kind: entry.kind, item: entry.source })}
            aria-label={`Edit ${entry.title}`}
            className="rounded-md p-1 hover:bg-black/10"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setDeletingEntry(entry)}
            aria-label={`Delete ${entry.title}`}
            className="rounded-md p-1 hover:bg-black/10"
          >
            <Trash2 className="size-4" />
          </button>
        </div>}
    </div>
  );
}
