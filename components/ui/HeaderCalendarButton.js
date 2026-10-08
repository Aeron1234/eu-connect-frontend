"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { useUser } from "@/contexts/UserContext";

const CALENDAR_ROLES = new Set(["student", "admin", "department_head"]);

export default function HeaderCalendarButton() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex size-11 shrink-0 items-center justify-center">
      <button
        type="button"
        aria-label="Open calendar"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="header-calendar"
        onClick={() => setOpen((value) => !value)}
        className="flex size-11 items-center justify-center rounded-lg text-foreground-soft transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <CalendarDays className="size-5" />
      </button>

      {open && (
        <div
          id="header-calendar"
          role="dialog"
          aria-label="Calendar"
          className="fixed left-1/2 top-16 z-50 mt-2 w-[min(19rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xl sm:absolute sm:right-0 sm:left-auto sm:top-full sm:translate-x-0"
        >
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={selectedDate}
            onSelect={(day) => day && setSelectedDate(day)}
            today={today}
            className="w-full bg-transparent p-0 [--cell-size:2.25rem]"
            classNames={{
              root: "w-full",
              month: "flex w-full flex-col gap-3",
              caption_label: "text-sm font-semibold text-foreground",
              weekday: "flex-1 text-xs font-medium text-muted-foreground",
              week: "mt-1 flex w-full border-b border-primary/35 pb-1",
              today: "rounded-md text-primary font-semibold",
              outside: "text-muted-foreground/70",
            }}
          />

          {CALENDAR_ROLES.has(user?.role) && (
            <Link
              href="/calendar"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-medium text-primary-emphasis transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Open full calendar
              <ArrowUpRight className="size-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
